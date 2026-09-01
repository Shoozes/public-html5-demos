import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WINDOWS_BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
];

export async function loadPlaywright() {
  const configuredRoots = process.env.CODEX_NODE_MODULES
    ? [process.env.CODEX_NODE_MODULES]
    : (process.env.NODE_PATH?.split(path.delimiter).filter(Boolean) || []);
  const failures = [];

  if (!configuredRoots.length) {
    try {
      const loaded = await import('playwright');
      return loaded.default || loaded;
    } catch (error) {
      failures.push(`package resolution: ${error.message}`);
    }
  }

  const moduleRoots = configuredRoots.length ? configuredRoots : [
    path.join(homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules')
  ];
  for (const moduleRoot of new Set(moduleRoots)) {
    const entry = path.join(moduleRoot, 'playwright', 'index.js');
    if (!existsSync(entry)) continue;
    try {
      const loaded = await import(pathToFileURL(entry).href);
      return loaded.default || loaded;
    } catch (error) {
      failures.push(`${entry}: ${error.message}`);
    }
  }

  throw new Error(`Playwright unavailable. Install it locally or set CODEX_NODE_MODULES/NODE_PATH. ${failures.join(' | ')}`);
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
