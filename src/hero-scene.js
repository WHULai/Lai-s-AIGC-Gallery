import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A locally rendered sculpture; no remote model, video, or texture is needed.
export function mountHero(container) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { return; } // The static geometric artwork remains visible without WebGL.
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.domElement.className = 'hero-canvas';
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 30);
  camera.position.set(0, 0, 7.2);
  const environment = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environmentTarget = generator.fromScene(environment, 0.04);
  scene.environment = environmentTarget.texture;
  environment.dispose();
  generator.dispose();

  const geometry = new THREE.TorusKnotGeometry(1.12, 0.32, 240, 8, 2, 3);
  const material = new THREE.MeshPhysicalMaterial({ color: 0x9b72ee, metalness: 0.88, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.18, envMapIntensity: 1.5 });
  const sculpture = new THREE.Mesh(geometry, material);
  sculpture.rotation.set(0.35, -0.25, -0.35);
  scene.add(sculpture);
  const key = new THREE.DirectionalLight(0xf2e9ff, 5);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9d6dff, 6);
  rim.position.set(4, -1, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 2);
  fill.position.set(2, 2, 3);
  scene.add(fill);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let contextAvailable = true;
  let frame = 0;
  let lastTime = 0;
  let rotation = 0;
  let lastRender = 0;
  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const animate = (time) => {
    frame = 0;
    if (!contextAvailable || !visible || document.hidden || motion.matches) return;
    if (time - lastRender >= 1000 / 30) {
      const elapsed = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
      rotation += elapsed * 0.13;
      sculpture.rotation.y = -0.25 + rotation;
      sculpture.rotation.x = 0.35 + Math.sin(rotation * 0.8) * 0.1;
      sculpture.position.y = Math.sin(rotation * 1.5) * 0.08;
      render();
      lastRender = time;
      lastTime = time;
    }
    frame = requestAnimationFrame(animate);
  };
  const resume = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!contextAvailable) return;
    if (!motion.matches && visible && !document.hidden) frame = requestAnimationFrame(animate);
    else render();
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
  observer.observe(container);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(container);
  motion.addEventListener('change', resume);
  document.addEventListener('visibilitychange', resume);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    contextAvailable = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    container.classList.remove('scene-ready');
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => { contextAvailable = true; resize(); container.classList.add('scene-ready'); resume(); });
  resize();
  container.classList.add('scene-ready');
  resume();

  // Vite hot-reload must not leave animation loops or graphics contexts behind.
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect(); sizeObserver.disconnect();
    motion.removeEventListener('change', resume);
    document.removeEventListener('visibilitychange', resume);
    geometry.dispose(); material.dispose(); environmentTarget.dispose(); renderer.dispose();
    renderer.domElement.remove();
    container.classList.remove('scene-ready');
  };
}
