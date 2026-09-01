import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../tools/ragdoll-parity/static-server.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const instance = createStaticServer(root);
const address = await instance.listen();
const get = (path) => fetch(`http://127.0.0.1:${address.port}${path}`);
const expectType = async (pathname, pattern) => {
  const response = await get(pathname);
  assert.equal(response.status, 200, pathname);
  assert.match(response.headers.get('content-type'), pattern, pathname);
  return response;
};

try {
  await expectType('/index.html', /text\/html/);
  await expectType('/ragdoll-lab/', /text\/html/);
  const moduleResponse = await expectType('/tests/ragdoll-lab-smoke.mjs', /application\/javascript/);
  assert.equal(moduleResponse.headers.get('x-content-type-options'), 'nosniff');
  await expectType('/assets/glb/Soldier.glb', /model\/gltf/);
  await expectType('/docs/haio-prompt-discovery/round-3/images/round-3-comparison.webp', /image\/webp/);
  assert.ok([403, 404].includes((await get('/%2e%2e/%2e%2e/secret.txt')).status));
  assert.equal((await get('/missing.exe')).status, 404);
  assert.match((await get('/README.md')).headers.get('content-type'), /application\/octet-stream/);
  const head = await fetch(`http://127.0.0.1:${address.port}/shared/ragdoll-parity/protocol.mjs`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.match(head.headers.get('content-type'), /application\/javascript/);
  assert.equal((await fetch(`http://127.0.0.1:${address.port}/index.html`, { method: 'POST' })).status, 405);
} finally {
  await instance.close();
  await instance.close();
}
console.log('Parity static server tests passed.');
