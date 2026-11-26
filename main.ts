// A working best-site-01 entry (Node 22, standard library only): the site is this directory's app/ folder, plain
// static files a browser opens at app/index.html (ES modules, CSS, no build step), its content held in its own files:
// nothing it runs, styles or shows loads over the network. The program hands it in: it copies app/ and screenshots/
// from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your screenshots, the
// first load's files and bytes, and your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts
// as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// A starting point, not a winner: a plain recipe collection, a list of recipes and a page for each. Build the site the
// brief asks for in app/ (its content, ease of use, a phone layout, its look), put 3 or 4 PNG or JPEG screenshots of
// it running in screenshots/ (the first by name is the cover; one may be a 390 x 844 phone view; shots.json says which
// views this starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import {
  cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function preflight(): { fileCount: number; screenshotCount: number } {
  const app = join(here, 'app');
  const index = join(app, 'index.html');
  if (!existsSync(index) || !lstatSync(index).isFile()) {
    throw new Error('app/index.html must exist and be a regular file.');
  }

  let entryCount = 0;
  let fileCount = 0;

  function inspectDirectory(directory: string): void {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const relative = path.slice(here.length);
      const info = lstatSync(path);
      entryCount += 1;
      if (entryCount > 993) {
        throw new Error('app/ exceeds 993 entries (files and directories).');
      }
      if (info.isDirectory()) {
        inspectDirectory(path);
      } else if (info.isFile()) {
        fileCount += 1;
        // Namespace declarations identify XML vocabularies, not network resources.
        // Remove only their quoted values; the same URL elsewhere is still rejected.
        const contents = readFileSync(path).toString('utf8').replace(
          /\bxmlns(?::[\w.-]+)?\s*=\s*(["'])(https?:\/\/[^"']+)\1/gi,
          'xmlns=""',
        );
        const externalUrl = contents.match(/https?:\/\/[^\s"'<>`\\]+/i);
        if (externalUrl) {
          throw new Error(`${relative} contains an absolute HTTP(S) URL: ${externalUrl[0]}`);
        }
      } else {
        throw new Error(`${relative} must be a regular file or directory (no symbolic links).`);
      }
    }
  }

  inspectDirectory(app);

  const screenshots = join(here, 'screenshots');
  if (!existsSync(screenshots) || !lstatSync(screenshots).isDirectory()) {
    throw new Error('screenshots/ must exist and contain 3 or 4 PNG/JPG files.');
  }
  const images = readdirSync(screenshots).filter((name) => /\.(?:png|jpe?g)$/i.test(name));
  if (images.length < 3 || images.length > 4) {
    throw new Error(`screenshots/ must contain 3 or 4 PNG/JPG files; found ${images.length}.`);
  }
  for (const name of images) {
    const info = lstatSync(join(screenshots, name));
    if (!info.isFile() || info.size >= 256 * 1024) {
      throw new Error(`screenshots/${name} must be a regular file smaller than 256 KiB.`);
    }
  }

  return { fileCount, screenshotCount: images.length };
}

let counts: { fileCount: number; screenshotCount: number };
try {
  counts = preflight();
} catch (error) {
  console.error(`Pre-flight failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

console.log(`Export complete: ${counts.fileCount} app files, ${counts.screenshotCount} screenshots.`);
