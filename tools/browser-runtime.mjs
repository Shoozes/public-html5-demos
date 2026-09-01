import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WINDOWS_BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

export async function loadPlaywright() {
  const moduleRoot = process.env.CODEX_NODE_MODULES || process.env.NODE_PATH;
  try {
    const loaded = await import(moduleRoot
      ? pathToFileURL(path.join(moduleRoot, 'playwright', 'index.js')).href
      : 'playwright');
    return loaded.default || loaded;
  } catch (error) {
    throw new Error(`Playwright unavailable: ${error.message}`, { cause: error });
  }
}

export function resolveBrowserExecutable() {
  return process.env.HAIO_BROWSER
    || process.env.PARITY_BROWSER
    || (process.platform === 'win32' ? WINDOWS_BROWSERS.find(existsSync) : undefined);
}

export async function launchChromium(options = {}) {
  const playwright = await loadPlaywright();
  const executablePath = resolveBrowserExecutable();
  return playwright.chromium.launch({
    headless: true,
    ...options,
    ...(executablePath ? { executablePath } : {})
  });
}
