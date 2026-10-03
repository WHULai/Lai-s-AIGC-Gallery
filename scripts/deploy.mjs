import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { root } from './catalog.mjs';

const args = process.argv.slice(2);
const project = 'lai-s-aigc-gallery';
const branch = 'main';

function run(command, commandArgs, cwd = root) {
  const result = spawnSync(command, commandArgs, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const error = new Error(`${command} ${commandArgs.join(' ')} failed${result.signal ? ` (${result.signal})` : ''}.`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

try {
  if (args.length > 1 || args.some(arg => arg !== '--dry-run')) {
    throw new Error('Usage: npm run deploy [-- --dry-run]');
  }

  run('npm', ['run', 'build']);
  if (args.includes('--dry-run')) {
    console.log(`Dry run successful. Built dist/; no upload, authentication, or Git changes.\nA real run uploads dist/ to Cloudflare Pages project ${project} (production branch ${branch}).`);
  } else {
    const wrangler = path.join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
    const temporary = mkdtempSync(path.join(os.tmpdir(), 'lai-aigc-pages-'));
    try {
      run(process.execPath, [wrangler, 'pages', 'deploy', path.join(root, 'dist'), `--project-name=${project}`, `--branch=${branch}`, '--commit-dirty=true'], temporary);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
    console.log(`Cloudflare Pages deployment completed.\nProduction site: https://${project}.pages.dev`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = error.exitCode ?? 1;
}
