import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '..');
export const categories = ['illustration', 'photographic'];
export const imagePattern = /\.(png|jpe?g|webp|avif)$/i;
export function validateMetadata(meta, folder) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.id) || meta.id !== folder) throw new Error(`${folder}: id must match its folder and use lowercase words separated by hyphens.`);
  for (const lang of ['en', 'zh']) {
    if (typeof meta.title?.[lang] !== 'string' || !meta.title[lang].trim()) throw new Error(`${folder}: title.${lang} is required.`);
  }
  if (!categories.includes(meta.category)) throw new Error(`${folder}: category must be ${categories.join(' or ')}.`);
  const date = new Date(meta.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== meta.date) throw new Error(`${folder}: date must be a valid YYYY-MM-DD date.`);
  if (!Array.isArray(meta.tags) || meta.tags.some(tag => typeof tag !== 'string' || !tag.trim())) throw new Error(`${folder}: tags must be an array of nonempty strings.`);
  if (meta.color && !/^#[\da-f]{6}$/i.test(meta.color)) throw new Error(`${folder}: color must be a six-digit hex color.`);
}

export async function readEntry(directory) {
  const folder = path.basename(directory);
  const meta = JSON.parse(await readFile(path.join(directory, 'entry.json'), 'utf8'));
  validateMetadata(meta, folder);
  const prompt = (await readFile(path.join(directory, 'prompt.txt'), 'utf8')).trim();
  if (!prompt) throw new Error(`${folder}: prompt.txt cannot be empty.`);
  const files = await readdir(directory);
  const findImage = async (prefix) => {
    const matches = files.filter(file => file.startsWith(`${prefix}.`) && imagePattern.test(file));
    if (matches.length !== 1) throw new Error(`${folder}: provide exactly one ${prefix} image (PNG/JPG/WebP/AVIF).`);
    const image = path.join(directory, matches[0]);
    if (!(await stat(image)).isFile() || !(await realpath(image)).startsWith((await realpath(directory)) + path.sep)) throw new Error(`${folder}: image must be a regular file inside the entry.`);
    return matches[0];
  };
  let source = '';
  try { source = (await readFile(path.join(directory, 'source.txt'), 'utf8')).trim(); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (source) {
    const url = new URL(source);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`${folder}: source must be an HTTP(S) URL.`);
  }
  return { ...meta, prompt, source, generated: await findImage('generated'), original: await findImage('original') };
}

export async function readCatalog(contentDirectory = path.join(root, 'content')) {
  const folders = (await readdir(contentDirectory, { withFileTypes: true })).filter(item => item.isDirectory() && !item.name.startsWith('.'));
  const entries = await Promise.all(folders.map(folder => readEntry(path.join(contentDirectory, folder.name))));
  return entries.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
