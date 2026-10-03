import './styles.css';

let disposeHero;
// Keep the functional gallery independent of the decorative 3D module.
const startHero = () => import('./hero-scene.js').then(({ mountHero }) => {
  disposeHero = mountHero(document.querySelector('#hero-art'));
}).catch(() => { /* The static artwork is the graceful fallback. */ });
if ('requestIdleCallback' in window) requestIdleCallback(startHero, { timeout: 1500 });
else setTimeout(startHero, 0);
if (import.meta.hot) import.meta.hot.dispose(() => disposeHero?.());

const icons = {
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
  moon: '<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escape = (value) => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const translations = {
  en: {
    skip: 'Skip to the collection', collection: 'Collection', about: 'About',
    eyebrow: 'AN EXPLORATION IN AI IMAGE MAKING', heroLine1: 'Reality,', heroLine2: 'reimagined.',
    heroDescription: 'Your photographs. A different dimension.\nExplore creative prompts that turn the familiar into the unexpected.',
    explore: 'Explore the gallery', madeWith: 'Real photographs. New possibilities.', collectionTitle: 'Ideas into images.', scroll: 'SCROLL TO EXPLORE', selectedLabel: 'SELECTED EXPERIMENTS', aboutLabel: 'THE EXPERIMENT CONTINUES',
    hoverHint: 'Hover over an image to see where it started',
    search: 'Search prompts…', newest: 'Newest first', oldest: 'Oldest first', sort: 'Sort prompts',
    emptyTitle: 'No prompts found', emptyDescription: 'Try another search or explore the whole collection.', reset: 'Reset search',
    collectionEnd: 'More experiments on the way.', aboutTitle: 'Keep experimenting.',
    aboutDescription: 'An evolving notebook of image-making experiments by Lai. Each prompt comes with a real result and its original photograph, so you can see the idea in action. Bring your own image, copy a prompt, and see what happens.',
    onGithub: 'Explore on GitHub', footerNote: 'Independent experiments. Open possibilities.', backTop: 'Back to top ↑',
    copy: 'Copy prompt', useChatGPT: 'Use in ChatGPT', copied: 'Copied!', copySuccess: 'Prompt copied. Make it your own.', copyFailed: 'Copy failed. Open the prompt and select its text to copy manually.',
    generated: 'AI creation', original: 'Original photo', showOriginal: 'See original', showGenerated: 'See AI creation', open: 'Explore prompt',
    detailLabel: 'THE IDEA BEHIND THE IMAGE', promptLabel: 'The prompt', promptLanguage: 'Original · English',
    usePhoto: 'Start with your own photo', useDescription: 'Use in ChatGPT opens a new tab with this prompt ready. Upload your photo there, then send it. Or copy the prompt into your preferred image generator.',
    close: 'Close prompt', fullSize: 'Open full-size image', share: 'Copy link', linkCopied: 'Prompt link copied.', themeDark: 'Switch to dark mode', themeLight: 'Switch to light mode', language: 'Switch to Chinese',
    loading: 'Gathering a little inspiration…', loadError: 'The collection could not be loaded. Please refresh the page.',
    results: (count, total) => `Showing ${count} of ${total} prompts`, sourceName: 'Xiaohongshu',
  },
  zh: {
    skip: '跳转至作品集', collection: '作品集', about: '关于', eyebrow: '探索 AI 影像创作的可能性', heroLine1: '熟悉的照片，', heroLine2: '全新的世界。',
    heroDescription: '你的照片，另一个维度。\n用创意提示词，让熟悉的画面变成意想不到的作品。', explore: '探索作品集', madeWith: '真实的照片，全新的可能。', collectionTitle: '让想法成为图像。', scroll: '向下探索', selectedLabel: '精选创作实验', aboutLabel: '实验，还在继续',
    hoverHint: '悬停图片，看看灵感从哪里开始', search: '搜索提示词…', newest: '最新优先', oldest: '最早优先', sort: '提示词排序',
    emptyTitle: '没有找到提示词', emptyDescription: '换个关键词，或浏览全部作品。', reset: '清空搜索', collectionEnd: '新的实验，持续发生。',
    aboutTitle: '继续，探索。', aboutDescription: '这是 Lai 持续更新的 AI 生图实验笔记。每份提示词都配有真实成果和原始照片，让想法的变化清晰可见。带上你的照片，复制一份提示词，看看会发生什么。',
    onGithub: '在 GitHub 上继续探索', footerNote: '独立创作，开放可能。', backTop: '回到顶部 ↑', copy: '复制提示词', useChatGPT: '在 ChatGPT 中使用', copied: '已复制！', copySuccess: '提示词已复制，开始你的创作吧。',
    copyFailed: '复制失败，请打开详情并手动选择提示词文字复制。', generated: 'AI 生成', original: '原始照片', showOriginal: '查看原图', showGenerated: '查看 AI 成果', open: '查看提示词',
    detailLabel: '图像背后的想法', promptLabel: '完整提示词', promptLanguage: '原始文本 · 英文', usePhoto: '从你的照片开始', useDescription: '点击「在 ChatGPT 中使用」，即可在新标签页带入完整提示词。上传你的照片后发送，也可以复制到你常用的生图工具。',
    close: '关闭详情', fullSize: '打开完整尺寸图片', share: '复制链接', linkCopied: '提示词链接已复制。', themeDark: '切换深色模式', themeLight: '切换浅色模式', language: 'Switch to English',
    loading: '正在收集一点灵感…', loadError: '无法加载作品集，请刷新页面重试。',
    results: (count, total) => `显示 ${count} / ${total} 份提示词`, sourceName: '小红书',
  },
};
const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferences remain active for this visit. */ } };
let language = ['en', 'zh'].includes(readPreference('gallery-language')) ? readPreference('gallery-language') : navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
let theme = ['light', 'dark'].includes(readPreference('gallery-theme')) ? readPreference('gallery-theme') : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let entries = [];
let activeEntry = null;
let detailImage = 'generated';
let toastTimer;
const $ = selector => document.querySelector(selector);
const t = key => translations[language][key] ?? key;
const localized = field => field[language] || field.en;
const asset = url => new URL(url, document.baseURI).href;
const chatGPTLink = entry => `https://chatgpt.com/?prompt=${encodeURIComponent(entry.prompt)}`;
const chatGPTMarkup = (entry, id = '') => `<a class="chatgpt-button" ${id ? `id="${id}"` : ''} href="${escape(chatGPTLink(entry))}" target="_blank" rel="noopener noreferrer">${icon('external')}<span>${t('useChatGPT')}</span></a>`;
const formatDate = date => new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
function sourceMarkup(entry) {
  if (!entry.source) return '';
  const host = new URL(entry.source).hostname;
  return `<a class="source-link" href="${escape(entry.source)}" target="_blank" rel="noopener noreferrer"><span>Adapted from:</span> ${escape(host.includes('xhslink') ? t('sourceName') : host)} <span aria-hidden="true">↗</span></a>`;
}
function updateTheme() {
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#100d19' : '#f3f0fa';
  $('#theme-toggle').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  $('#theme-toggle').setAttribute('aria-label', t(theme === 'dark' ? 'themeLight' : 'themeDark'));
  $('#theme-toggle').title = $('#theme-toggle').getAttribute('aria-label');
}
function updateLanguage() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? 'Lai’s AIGC Gallery — 熟悉的照片，全新的世界' : 'Lai’s AIGC Gallery — Reality, reimagined.';
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  $('#language-toggle').innerHTML = `<span class="${language === 'en' ? 'selected-language' : ''}">EN</span><span class="language-slash">/</span><span class="${language === 'zh' ? 'selected-language' : ''}">中文</span>`;
  $('#language-toggle').setAttribute('aria-label', t('language'));
  $('#search').placeholder = t('search');
  $('#search').setAttribute('aria-label', t('search'));
  const sort = $('#sort').value || 'newest';
  $('#sort').innerHTML = `<option value="newest">${t('newest')}</option><option value="oldest">${t('oldest')}</option>`;
  $('#sort').value = sort;
  $('#sort').setAttribute('aria-label', t('sort'));
  updateTheme();
  renderGallery();
  if (activeEntry) renderDetail();
}
function renderGallery() {
  const query = $('#search').value.trim().toLocaleLowerCase();
  const visible = entries.filter(entry => !query || [entry.title.en, entry.title.zh, entry.prompt].join(' ').toLocaleLowerCase().includes(query));
  visible.sort((a, b) => ($('#sort').value === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) || a.id.localeCompare(b.id));
  $('#total-count').textContent = String(entries.length).padStart(2, '0');
  $('#result-status').textContent = entries.length ? t('results')(visible.length, entries.length) : t('loading');
  $('#empty-state').hidden = !entries.length || visible.length > 0;
  $('#gallery').innerHTML = visible.map((entry, index) => `<article class="prompt-card" data-id="${entry.id}" style="--image-bg:${entry.color || '#f4f1eb'}">
    <div class="card-visual"><button class="image-open" type="button" data-action="open" aria-label="${escape(t('open') + ': ' + localized(entry.title))}"><img class="generated-image" src="${asset(entry.generatedThumb)}" alt="${escape(localized(entry.title))}" width="${entry.generatedSize.width}" height="${entry.generatedSize.height}" ${index > 1 ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" /><img class="original-image" src="${asset(entry.originalThumb)}" alt="" aria-hidden="true" width="${entry.originalSize.width}" height="${entry.originalSize.height}" loading="lazy" decoding="async" /></button>
      <span class="image-badge generated-badge"><span class="badge-dot"></span>${t('generated')}</span><span class="image-badge original-badge">${t('original')}</span><span class="open-indicator" aria-hidden="true">↗</span>
      <button class="compare-button" data-action="compare" type="button" aria-pressed="false">↔ <span>${t('showOriginal')}</span></button></div>
    <div class="card-body"><div class="card-meta"><time datetime="${entry.date}">${formatDate(entry.date)}</time></div><h3><button data-action="open" type="button">${escape(localized(entry.title))}</button></h3><div class="card-bottom">${sourceMarkup(entry)}<div class="card-actions"><button class="copy-button" data-action="copy" type="button">${icon('copy')}<span>${t('copy')}</span></button>${chatGPTMarkup(entry)}</div></div></div>
  </article>`).join('');
}
function renderDetail() {
  const entry = activeEntry;
  const scroll = $('#detail-content .detail-copy')?.scrollTop || 0;
  $('#detail-content').innerHTML = `<div class="detail-layout"><div class="detail-viewer"><div class="detail-image-toolbar"><div class="image-tabs" role="group" aria-label="${t('original')} / ${t('generated')}"><button type="button" data-view="generated" aria-pressed="${detailImage === 'generated'}">${t('generated')}</button><button type="button" data-view="original" aria-pressed="${detailImage === 'original'}">${t('original')}</button></div><a class="icon-button" id="full-size-link" href="${asset(entry[detailImage])}" target="_blank" rel="noopener noreferrer" aria-label="${t('fullSize')}" title="${t('fullSize')}">${icon('external')}</a></div><div class="detail-image-wrap" style="--image-bg:${entry.color || '#f4f1eb'}"><img id="detail-image" src="${asset(entry[detailImage])}" alt="${escape(localized(entry.title) + ' — ' + t(detailImage))}" /></div><div class="detail-image-caption"><time datetime="${entry.date}">${formatDate(entry.date)}</time></div></div><div class="detail-copy"><div class="detail-top"><span class="eyebrow">${t('detailLabel')}</span><button class="icon-button" id="close-dialog" type="button" aria-label="${t('close')}">${icon('close')}</button></div><h2 id="detail-title">${escape(localized(entry.title))}</h2>${sourceMarkup(entry)}<div class="usage-note"><span aria-hidden="true">↗</span><div><strong>${t('usePhoto')}</strong><p>${t('useDescription')}</p></div></div><div class="prompt-heading"><h3>${t('promptLabel')}</h3><span>${t('promptLanguage')}</span></div><pre class="prompt-text" tabindex="0">${escape(entry.prompt)}</pre><div class="detail-actions"><button type="button" class="primary-button" id="detail-copy-button">${icon('copy')}<span>${t('copy')}</span></button>${chatGPTMarkup(entry, 'detail-chatgpt-button')}<button type="button" class="secondary-button" id="share-button">${icon('external')}<span>${t('share')}</span></button></div></div></div>`;
  $('#detail-content .detail-copy').scrollTop = scroll;
}
function syncDialog() {
  const id = location.hash.startsWith('#prompt=') ? location.hash.slice(8) : '';
  const entry = entries.find(item => item.id === id);
  if (entry) {
    if (activeEntry?.id !== id) detailImage = 'generated';
    activeEntry = entry;
    renderDetail();
    if (!$('#prompt-dialog').open) { $('#prompt-dialog').showModal(); document.body.classList.add('dialog-open'); $('#close-dialog').focus(); }
  } else {
    activeEntry = null;
    $('#prompt-dialog').close();
    document.body.classList.remove('dialog-open');
  }
}
function closeDialog() {
  history.replaceState(null, '', location.pathname + location.search + '#collection');
  syncDialog();
}
function notify(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
}
async function copyText(text, button, successMessage) {
  try {
    try { await navigator.clipboard.writeText(text); } catch {
      const previousFocus = document.activeElement;
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.className = 'clipboard-fallback';
      ($('#prompt-dialog').open ? $('#prompt-dialog') : document.body).append(textarea);
      textarea.focus(); textarea.select();
      const success = document.execCommand('copy');
      textarea.remove(); previousFocus?.focus();
      if (!success) throw new Error('Clipboard unavailable');
    }
    if (button?.isConnected) {
      button.innerHTML = `${icon('check')}<span>${t('copied')}</span>`;
      setTimeout(() => { if (button.isConnected) button.innerHTML = `${icon(button.id === 'share-button' ? 'external' : 'copy')}<span>${t(button.id === 'share-button' ? 'share' : 'copy')}</span>`; }, 2200);
    }
    notify(t(successMessage));
  } catch { notify(t('copyFailed')); }
}
$('#year').textContent = new Date().getFullYear();
$('#search-icon').innerHTML = icon('search');
$('#language-toggle').addEventListener('click', () => { language = language === 'en' ? 'zh' : 'en'; savePreference('gallery-language', language); updateLanguage(); });
$('#theme-toggle').addEventListener('click', () => { theme = theme === 'light' ? 'dark' : 'light'; savePreference('gallery-theme', theme); updateTheme(); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => { if (!readPreference('gallery-theme')) { theme = event.matches ? 'dark' : 'light'; updateTheme(); } });
$('#search').addEventListener('input', renderGallery);
$('#sort').addEventListener('change', renderGallery);
$('#reset-search').addEventListener('click', () => { $('#search').value = ''; renderGallery(); $('#search').focus(); });
$('#gallery').addEventListener('click', event => {
  const card = event.target.closest('.prompt-card');
  if (!card || event.target.closest('a')) return;
  const entry = entries.find(item => item.id === card.dataset.id);
  const action = event.target.closest('[data-action]');
  if (action?.dataset.action === 'copy') { copyText(entry.prompt, action, 'copySuccess'); return; }
  if (action?.dataset.action === 'compare') {
    const original = card.classList.toggle('show-original');
    action.setAttribute('aria-pressed', original);
    action.querySelector('span').textContent = t(original ? 'showGenerated' : 'showOriginal');
    return;
  }
  location.hash = `prompt=${entry.id}`;
});
$('#detail-content').addEventListener('click', event => {
  if (event.target.closest('#close-dialog')) closeDialog();
  if (event.target.closest('#detail-copy-button')) copyText(activeEntry.prompt, $('#detail-copy-button'), 'copySuccess');
  if (event.target.closest('#share-button')) copyText(location.href, $('#share-button'), 'linkCopied');
  const view = event.target.closest('[data-view]');
  if (view) {
    detailImage = view.dataset.view;
    $('#detail-image').src = asset(activeEntry[detailImage]);
    $('#detail-image').alt = `${localized(activeEntry.title)} — ${t(detailImage)}`;
    $('#full-size-link').href = asset(activeEntry[detailImage]);
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', button.dataset.view === detailImage));
  }
});
$('#prompt-dialog').addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
$('#prompt-dialog').addEventListener('click', event => { if (event.target === $('#prompt-dialog')) { const bounds = $('#prompt-dialog').getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(); } });
window.addEventListener('hashchange', syncDialog);
updateLanguage();
try {
  const response = await fetch(asset('./data/catalog.json'));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  entries = await response.json();
  $('#gallery').setAttribute('aria-busy', 'false');
  renderGallery(); syncDialog();
  if (!entries.length) { $('#result-status').textContent = t('results')(0, 0); $('#empty-state').hidden = false; }
} catch (error) {
  console.error('Unable to load gallery:', error);
  $('#gallery').setAttribute('aria-busy', 'false');
  $('#result-status').textContent = '';
  $('#load-error').textContent = t('loadError');
  $('#load-error').hidden = false;
}
