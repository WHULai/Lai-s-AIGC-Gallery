import { parseArgs } from 'node:util';
import { access, copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { root, readEntry, imagePattern } from './catalog.mjs';

const { values } = parseArgs({ options: Object.fromEntries(['from', 'id', 'title', 'title-zh', 'category', 'tags', 'date', 'source'].map(key => [key, { type: 'string' }])) });
const required = ['from', 'id', 'title', 'title-zh', 'category'];
if (required.some(key => !values[key])) {
  console.error(`Usage: npm run add -- --from ./incoming --id my-prompt --title "English title" --title-zh "中文标题" --category illustration [--tags impasto,miniature] [--date YYYY-MM-DD] [--source https://example.com]\nThe input folder needs prompt.txt (or prompt), generated.* (or AIGC.*), and original.* (or Original.*). source.txt (or source) is optional.`);
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.id)) throw new Error('Use a lowercase, hyphen-separated id.');
const incoming = path.resolve(values.from);
const destination = path.join(root, 'content', values.id);
try { await access(destination); throw new Error(`The entry ${values.id} already exists; it will not be overwritten.`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const temporary = path.join(root, 'content', `.incoming-${values.id}-${process.pid}`);
await mkdir(temporary);
try {
  const files = await readdir(incoming);
  const promptFile = files.find(file => file === 'prompt.txt') || files.find(file => file === 'prompt');
  if (!promptFile) throw new Error('The input folder needs prompt.txt or prompt.');
  await copyFile(path.join(incoming, promptFile), path.join(temporary, 'prompt.txt'));
  for (const [type, names] of [['generated', ['generated', 'aigc']], ['original', ['original']]]) {
    const images = files.filter(file => imagePattern.test(file) && names.includes(path.parse(file).name.toLowerCase()));
    if (images.length !== 1) throw new Error(`The input folder needs exactly one ${type} image.`);
    await copyFile(path.join(incoming, images[0]), path.join(temporary, `${type}${path.extname(images[0]).toLowerCase()}`));
  }
  const sourceFile = files.find(file => file === 'source.txt') || files.find(file => file === 'source');
  const source = values.source ?? (sourceFile ? await readFile(path.join(incoming, sourceFile), 'utf8') : '');
  if (source.trim()) await writeFile(path.join(temporary, 'source.txt'), source.trim() + '\n');
  const date = values.date || new Intl.DateTimeFormat('sv-SE').format(new Date());
  const metadata = { id: values.id, date, title: { en: values.title, zh: values['title-zh'] }, category: values.category, tags: (values.tags || '').split(',').map(tag => tag.trim()).filter(Boolean) };
  await writeFile(path.join(temporary, 'entry.json'), JSON.stringify(metadata, null, 2) + '\n');
  // Validate under its final id before publishing the new entry locally.
  await rename(temporary, destination);
  try { await readEntry(destination); } catch (error) { await rename(destination, temporary); throw error; }
  console.log(`Added content/${values.id}. Run npm run dev to preview, or npm run deploy to publish.`);
} catch (error) {
  await rm(temporary, { recursive: true, force: true });
  throw error;
}
