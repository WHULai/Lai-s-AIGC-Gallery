import { mkdir, rm, copyFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { root, readCatalog } from './catalog.mjs';

const entries = await readCatalog();
const output = path.join(root, 'public/data');
const temporary = path.join(root, 'public/.data-build');
await rm(temporary, { recursive: true, force: true });
await mkdir(temporary, { recursive: true });
try {
  const catalog = await Promise.all(entries.map(async (entry) => {
    const destination = path.join(temporary, entry.id);
    await mkdir(destination);
    const result = { ...entry };
    for (const type of ['generated', 'original']) {
      const input = path.join(root, 'content', entry.id, entry[type]);
      const info = await sharp(input).metadata();
      if (!info.width || !info.height) throw new Error(`${entry.id}: invalid ${type} image.`);
      await sharp(input).rotate().resize({ width: 1100, withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(destination, `${type}-thumb.webp`));
      await copyFile(input, path.join(destination, entry[type]));
      result[type] = `./data/${entry.id}/${entry[type]}`;
      result[`${type}Thumb`] = `./data/${entry.id}/${type}-thumb.webp`;
      result[`${type}Size`] = { width: info.width, height: info.height };
    }
    return result;
  }));
  await writeFile(path.join(temporary, 'catalog.json'), JSON.stringify(catalog));
  await rm(output, { recursive: true, force: true });
  await rename(temporary, output);
  console.log(`Prepared ${catalog.length} prompts with optimized thumbnails and original full-size images.`);
} catch (error) {
  await rm(temporary, { recursive: true, force: true });
  throw error;
}
