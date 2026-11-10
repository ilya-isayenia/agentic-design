// The apps in apps/* and where each is served. `web` is the signup app at the site root; every other app
// lives under its own folder name, in dev, in the static builds the tests serve, and on Pages.
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** @returns {string[]} app folder names, `web` first */
export function apps() {
  return readdirSync(`${root}/apps`)
    .filter((a) => existsSync(`${root}/apps/${a}/package.json`))
    .sort((a, b) => (a === 'web' ? -1 : b === 'web' ? 1 : a.localeCompare(b)));
}

/** @param {string} app @returns {string} the URL base, e.g. /agentic-design/ or /agentic-design/landing/ */
export function basePath(app) {
  return app === 'web' ? '/agentic-design/' : `/agentic-design/${app}/`;
}

/** @param {string} [dir] repository root of the build to serve @returns {string[]} serve.mjs mounts for every built app */
export function appMounts(dir = root) {
  return apps().map((a) => `${basePath(a)}=${dir}/apps/${a}/dist`);
}

/** @returns {string[]} brands with token files, e.g. ['lumen', 'pulse', 'volt'] */
export function brands() {
  return readdirSync(`${root}/packages/tokens/src/brands`).sort();
}
