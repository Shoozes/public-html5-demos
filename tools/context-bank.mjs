import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bank = JSON.parse(await readFile(path.join(root, 'summary_bank.json'), 'utf8'));
const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8'
}).trim().split(/\r?\n/).filter(Boolean).map((file) => file.replaceAll('\\', '/'));
const trackedSet = new Set(tracked);
const failures = [];
const rows = [];

const check = (condition, message) => { if (!condition) failures.push(message); };
const escapeRegex = (value) => value.replace(/[.+^${}()|[\]\\]/g, '\\$&');
const globRegex = (pattern) => {
  let source = '';
  for (let index = 0; index < pattern.length; index += 1) {
    if (pattern[index] !== '*') {
      source += escapeRegex(pattern[index]);
      continue;
    }
    if (pattern[index + 1] === '*') {
      source += pattern[index + 2] === '/' ? '(?:.*/)?' : '.*';
      index += pattern[index + 2] === '/' ? 2 : 1;
    } else {
      source += '[^/]*';
    }
  }
  return new RegExp(`^${source}$`);
};

const skipped = bank.defaults?.skip_dirs || [];
const isSkipped = (file) => skipped.some((directory) => file === directory || file.startsWith(`${directory}/`));
const expand = (pattern) => {
  if (!pattern.includes('*')) {
    if (trackedSet.has(pattern)) return [pattern];
    return tracked.filter((file) => file.startsWith(`${pattern.replace(/\/$/, '')}/`));
  }
  const matcher = globRegex(pattern);
  return tracked.filter((file) => matcher.test(file));
};

check(bank.schema_version === 1, 'unsupported summary bank schema');
check(bank.defaults && Array.isArray(bank.defaults.groups), 'defaults.groups must be an array');
check(Number.isFinite(bank.defaults?.max_kb) && bank.defaults.max_kb > 0, 'defaults.max_kb must be positive');
check(bank.groups && typeof bank.groups === 'object', 'groups object is missing');

for (const defaultGroup of bank.defaults?.groups || []) {
  check(bank.groups?.[defaultGroup], `default group does not exist: ${defaultGroup}`);
  check(!bank.groups?.[defaultGroup]?._archived, `archived group is in defaults: ${defaultGroup}`);
}

for (const [name, group] of Object.entries(bank.groups || {})) {
  check(/^(?:repo|demo|feature|subsystem|issue|investigation|workflow)__[a-z0-9_]+$/.test(name), `group name is not stable/focused: ${name}`);
  check(typeof group.description === 'string' && group.description.length >= 24, `${name}: description is missing or too vague`);
  check(Array.isArray(group.paths) && group.paths.length > 0, `${name}: paths must be a non-empty array`);
  const files = new Set();
  for (const pattern of group.paths || []) {
    check(typeof pattern === 'string' && pattern.length > 0, `${name}: invalid path entry`);
    check(!path.isAbsolute(pattern), `${name}: absolute path is not portable: ${pattern}`);
    check(!isSkipped(pattern), `${name}: skipped/runtime path is routed: ${pattern}`);
    const matches = expand(pattern).filter((file) => !isSkipped(file));
    check(matches.length > 0, `${name}: path matches no repository file: ${pattern}`);
    for (const file of matches) files.add(file);
  }
  const binaries = [...files].filter((file) => /\.(?:glb|ogg|png|webp|gif|jpe?g|mp4|wav)$/i.test(file));
  check(binaries.length === 0, `${name}: binary/runtime payloads do not belong in context routes: ${binaries.join(', ')}`);
  const sizes = await Promise.all([...files].map(async (file) => (await stat(path.join(root, file))).size));
  const bytes = sizes.reduce((total, size) => total + size, 0);
  const limitKb = group.max_kb || bank.defaults.max_kb;
  check(bytes <= limitKb * 1024, `${name}: ${Math.ceil(bytes / 1024)} KiB exceeds ${limitKb} KiB`);
  rows.push({ name, files: files.size, kb: Math.ceil(bytes / 1024), archived: Boolean(group._archived) });
}

const defaultFiles = new Set((bank.defaults?.groups || []).flatMap((name) => {
  const group = bank.groups?.[name];
  return (group?.paths || []).flatMap(expand).filter((file) => !isSkipped(file));
}));
const defaultSizes = await Promise.all([...defaultFiles].map(async (file) => (await stat(path.join(root, file))).size));
const defaultBytes = defaultSizes.reduce((total, size) => total + size, 0);
check(defaultBytes <= bank.defaults.max_kb * 1024, `default union is ${Math.ceil(defaultBytes / 1024)} KiB, above ${bank.defaults.max_kb} KiB`);

if (process.argv.includes('--list')) {
  for (const row of rows) console.log(`${row.name}\t${row.files} files\t${row.kb} KiB${row.archived ? '\tarchived' : ''}`);
  console.log(`defaults\t${defaultFiles.size} files\t${Math.ceil(defaultBytes / 1024)} KiB`);
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Summary bank passed: ${rows.length} focused groups; default union ${Math.ceil(defaultBytes / 1024)} KiB.`);
