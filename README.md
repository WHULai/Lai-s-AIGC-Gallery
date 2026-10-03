# Lai’s AIGC Gallery

A small, bilingual gallery of AI image prompts, generated artwork, and original photographs. Built with vanilla JavaScript and CSS, Vite, Three.js, and a file-based content pipeline. No database, API key, or paid hosting is needed.

The site is built locally and uploaded directly to Cloudflare Pages. GitHub stores the editable source; publishing to Cloudflare does not depend on GitHub integration.

## Run on another computer

Install Git, Node.js **22.12 or later**, and npm. Add this computer's SSH public key to your GitHub account, then clone the source and install dependencies:

```sh
git clone git@github.com:WHULai/Lai-s-AIGC-Gallery.git
cd Lai-s-AIGC-Gallery
npm ci
npm run dev
```

Open the local address printed by Vite (normally `http://127.0.0.1:4173`). To edit content, change files under `content/`, then restart the development server to regenerate the catalog. Changes to the page's JS/CSS update live.

```sh
npm run build       # validate content, generate assets, build dist/
npm run preview     # serve the production build locally
```

## How the gallery works

- The interface defaults to English; a browser whose primary language is Chinese defaults to Chinese. Visitors can switch at any time. Explicit language/theme choices are saved locally.
- The theme follows the system preference until a visitor chooses light or dark.
- Generated images are the default covers. Hover to see the original photograph. A comparison button provides the same interaction on touchscreens and keyboards.
- Click a card to see the uncropped, full-size image and full prompt. Switch between original/generated views, open either image at its native size, copy the prompt, or copy a direct link.
- Cards and the detail view include **`Use in ChatGPT`**, which opens ChatGPT with the full original prompt. Upload your photograph there, then send the prompt to try it.
- Prompts are copied exactly as stored (apart from surrounding whitespace). The sample prompts are English originals; the UI and entry titles are bilingual. The interface does not silently translate prompt text.
- Entries with a source display **`Adapted from:`**, linking to the supplied source. Omit the source file when there is no source.
- Search includes English/Chinese titles and prompt text. Search and date sorting work entirely in the browser.
- The layout adapts to mobile screens, supports keyboard controls and Escape-to-close, and respects reduced-motion preferences.
- The design uses a purple palette, large sans-serif typography, and a locally rendered 3D sculpture. The sculpture loads separately from the functional gallery, runs at up to 30 frames per second, pauses while offscreen or the tab is hidden, and stays still when reduced motion is enabled. A static geometric illustration remains available when WebGL is unsupported.

## Content structure

Each prompt has its own folder. These source files are the only content you maintain:

```text
content/
  second-world/
    entry.json
    prompt.txt
    source.txt          # optional: one HTTP(S) source URL
    generated.png       # the AI output
    original.jpg        # the reference photograph
```

Images can be `.png`, `.jpg`, `.jpeg`, `.webp`, or `.avif`; include exactly one `generated.*` and one `original.*` per entry. The full-size originals are preserved. The pipeline strips metadata from the WebP thumbnails, creates thumbnails up to 1100px wide, and writes the browser catalog to the ignored `public/data/` folder. **Full-size files are copied intact, including any embedded metadata.** `dist/` is also generated and ignored.

Example `entry.json`:

```json
{
  "id": "my-new-prompt",
  "date": "2026-10-02",
  "title": { "en": "My new prompt", "zh": "我的新提示词" },
  "color": "#faf9f6"
}
```

The id must match the folder name and contain lowercase letters/numbers separated by hyphens. Both language versions of the title are required. No description field is needed. Dates use `YYYY-MM-DD`. The optional color is the image's background.

## Add a prompt with one command

Prepare an incoming folder containing `prompt.txt`, `generated.*`, and `original.*`, plus optional `source.txt`. The original sample naming (`prompt`, `AIGC.png`, `Original.jpg`, `source`) is also supported. Run:

```sh
npm run add -- \
  --from "/path/to/incoming-folder" \
  --id "my-new-prompt" \
  --title "My new prompt" \
  --title-zh "我的新提示词" \
  --date "2026-10-02"
```

`--date` is optional and defaults to today's date on your machine. `--source "https://example.com/post"` overrides the incoming source file. The command copies inputs and never overwrites an existing entry. You can also add folders manually following the structure above. Preview before publishing.

## Publish to Cloudflare Pages

The live production site is [https://lai-s-aigc-gallery.pages.dev](https://lai-s-aigc-gallery.pages.dev), in the Pages project `lai-s-aigc-gallery` with production branch `main`. The project uses **Direct Upload**, so you do not need to create a GitHub repository or connect a Git account. Cloudflare's [Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/) describes this workflow.

### One-time setup

1. Sign in to your Cloudflare account. Wrangler is included in the project's npm dependencies; `npm ci` installs the version recorded in `package-lock.json`.
2. Authorize this computer once:

```sh
npm run cf:login
```

The browser asks permission to read your account/user information and manage Pages. Wrangler also requests offline access so later deployments can reuse the authorization. If you prefer to open the authorization link in Dia yourself, run `npm run cf:login -- --browser=false` and open the URL printed in the terminal.

3. If the Pages project has not been created yet, create it once with production branch `main`:

```sh
npx wrangler pages project create lai-s-aigc-gallery --production-branch=main --force
```

The `--force` flag keeps project creation on Pages when the command is run by a coding agent.

The deployment script always targets this project and production branch, regardless of any local Git branch. To deploy from another computer, clone the repository, run `npm ci`, then authorize that computer with `npm run cf:login`. If your login expires, run `npm run cf:login` again.

### One-command updates

```sh
npm run deploy -- --dry-run   # validate content and build only
npm run deploy               # build and upload dist/ to Cloudflare Pages
```

After adding a new prompt under `content/`, `npm run deploy` is the single command needed to publish the update. It validates the content, generates thumbnails/catalog data, builds `dist/`, and uploads that directory with the locally installed Wrangler CLI. The terminal prints Cloudflare's deployment result and URL. Build or upload failures stop the command and return a nonzero exit status.

On macOS, you can also double-click `Deploy.command` in the project folder. It opens Terminal, runs the same deployment command from the correct folder, and leaves a success or failure message visible until you press Enter.

The dry run builds without uploading, requesting Cloudflare authorization, or changing Git. The real run uploads the site without staging files, committing, or pushing source code. A local Git repository or commits are not required. If you intentionally use a different Pages project, update `project` in `scripts/deploy.mjs` and this README.

### Synchronize source with GitHub

The source repository is [WHULai/Lai-s-AIGC-Gallery](https://github.com/WHULai/Lai-s-AIGC-Gallery). Cloudflare receives the generated website in `dist/`; GitHub stores the editable project, including entries, images, prompts, scripts, and the lockfile. Generated files, dependencies, local caches, and `.env` files are ignored by Git.

Before working on a computer, pull the latest source:

```sh
git pull --ff-only
```

After editing and checking the preview, deploy first, then commit and push the source:

```sh
npm run deploy
git add --all
git commit -m "Add new gallery entries"
git push origin main
```

The deployment command and `Deploy.command` publish to Cloudflare; committing and pushing synchronize the source separately. Another computer can then run `git pull --ff-only` to receive the changes. Run `npm ci` after dependency or lockfile changes. Wrangler authorization is local to each computer: run `npm run cf:login` there once rather than copying login credentials. Do not add credentials to the repository.

Direct Upload projects cannot be converted to Git integration later. If you want automatic deployments from a Git provider in the future, create a new Pages project for that integration.

## Edit the design

```text
index.html                 Page structure and metadata
src/app.js                 Interactions and English/Chinese interface strings
src/styles.css             Responsive layout, typography, light/dark variables
src/hero-scene.js           Three.js sculpture, lighting, and animation lifecycle
public/favicon.svg         Gallery symbol
scripts/catalog.mjs        Content schema and validation
scripts/prepare-content.mjs Asset and catalog generation
scripts/add-prompt.mjs      Import helper
scripts/deploy.mjs          Cloudflare Pages publishing helper
```

The typefaces are Space Grotesk and Manrope, loaded from Google Fonts with system fallbacks; everything else, including the 3D geometry and lighting, is served by the site. If you need an entirely offline/self-hosted page, remove the first `@import` in `src/styles.css` or self-host those fonts. Change the light/dark CSS variables at the top of that file to adjust the palette. To edit the sculpture, change its geometry, material, or lights in `src/hero-scene.js`; the animation respects system reduced-motion settings.

## Browser checks

```sh
npx playwright install chromium
npm test
```

The checks cover desktop/mobile interactions, actual clipboard contents, ChatGPT prompt links, original-image comparison, deep links, search/sorting, Chinese browser defaults, preference persistence, and horizontal overflow.

## Attribution and reuse

Source credits are shown on each applicable card and detail page. Source references are attribution, not a license grant. No blanket license is claimed for third-party prompts or images. Review each source's permissions before redistributing its material, and use photographs you have permission to upload to your chosen image generator.
