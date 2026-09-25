import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This file is copied into the clean packet's tools/ directory by the exporter.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'submission/index.html'), 'utf8');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
check(/^\s*<!doctype html>/i.test(html) && /<\/html>\s*$/i.test(html), 'Incomplete HTML document');
const modules = [...html.matchAll(/<script\s+type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)];
check(modules.length === 1, 'Expected one inline module');
check(html.includes('three@0.185.1/build/three.webgpu.js'), 'Pinned WebGPU import missing');
check(html.includes('three@0.185.1/build/three.tsl.js'), 'Pinned TSL import missing');
check(/new THREE\.WebGPURenderer/.test(html), 'WebGPURenderer missing');
check(/await (?:state\.)?renderer\.init\(\)/.test(html), 'Awaited renderer initialization missing');
check(/MeshStandardNodeMaterial/.test(html), 'Lit node materials missing');
check(!/(ShaderMaterial|RawShaderMaterial|gl_Position|@vertex|@fragment)/.test(html), 'Forbidden shader source/material');
check(!/<(?:img|audio|video|source)\b[^>]*\bsrc=["']https?:/i.test(html), 'External runtime media');
check(/window\.__haio\s*=/.test(html), 'Required diagnostics missing');
const temporary = await mkdtemp(path.join(tmpdir(), 'round55-parse-'));
try {
  for (const [index, match] of modules.entries()) {
    const filename = path.join(temporary, `${index}.mjs`);
    await writeFile(filename, match[1]);
    const parsed = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8' });
    check(parsed.status === 0, `Module does not parse: ${parsed.stderr || parsed.stdout}`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
if (errors.length) throw new Error(errors.join('\n'));
console.log('Static submission checks passed. Browser, visual, evidence and independent operator gates are still required.');
