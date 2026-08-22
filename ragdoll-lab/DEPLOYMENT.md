# Soldier Ragdoll Lab deployment workflow

This document is the operating contract for agents changing or deploying Soldier Ragdoll Lab.

## Authority and deployment targets

- `ragdoll-lab/index.html` and its referenced files under `assets/` are the authoritative implementation.
- GitHub Pages publishes `main` directly at <https://shoozes.github.io/public-html5-demos/ragdoll-lab/>.
- ChatGPT Sites is an additional deployment target at <https://ragdoll-physics-demo.shoozes.chatgpt.site>.
- The existing GitHub Pages deployment must remain intact.
- Never make a behavior or asset change only in the generated Sites copy.

The ChatGPT Sites checkout has its own deployment repository and a one-way synchronization script. Its `source/ragdoll-manifest.json` records the exact upstream commit and hashes of every copied file.

## Standard update flow

### 1. Change the authoritative demo

Work in this repository. Limit changes to the ragdoll demo and assets it actually uses:

- `ragdoll-lab/index.html`
- `assets/glb/Soldier.glb`
- `assets/ogg/music/backroom-static-track.ogg`
- `assets/ogg/sfx/YEET.ogg`
- `tests/ragdoll-lab-smoke.mjs`

Do not modify unrelated demos.

### 2. Test the authoritative source

From this repository root:

```bash
node tests/ragdoll-lab-smoke.mjs
```

Perform browser interaction and responsive checks when behavior, rendering, input, audio, or layout changed.

### 3. Commit and push GitHub `main`

Commit the tested authoritative change and push it to `Shoozes/public-html5-demos`.

GitHub Pages publishes that commit independently. A GitHub push does **not** automatically update ChatGPT Sites.

### 4. Synchronize the Sites checkout

From the `ragdoll-physics-demo` ChatGPT Sites checkout:

```bash
npm run sync:ragdoll
npm run parity:ragdoll:upstream
```

`sync:ragdoll` resolves upstream `main`, downloads only the four allowlisted runtime files, validates them, writes the generated copy, and refreshes `source/ragdoll-manifest.json`.

`parity:ragdoll:upstream` must prove both of the following:

- the Sites files match the recorded hashes;
- the recorded source revision equals current upstream `main`.

If a new runtime asset is required, update the Sites synchronization allowlist and its tests deliberately. Do not bypass the parity contract by copying files manually.

### 5. Validate the Sites build

From the Sites checkout:

```bash
npm test
npm run lint
```

These gates cover local parity, runtime smoke checks, production build output, routing, and deliberate drift rejection.

### 6. Checkpoint and deploy

Use the ChatGPT Sites checkpoint lifecycle for the `ragdoll-physics-demo` checkout.

A checkpoint:

1. commits and pushes the exact Sites source state;
2. saves an immutable Sites version;
3. starts a production deployment of that saved version.

Do not call lower-level save or deployment operations separately. If deployment starts asynchronously, monitor its exact deployment ID until terminal and verify the final status directly.

### 7. Verify production

The update is complete only when:

- the Sites deployment reports `succeeded`;
- the live response contains the expected source revision or changed behavior;
- required assets return successfully;
- browser console and interaction checks show no migration regression;
- GitHub Pages still works and remains unchanged as a deployment target.

## Site-only changes

Routing, Site packaging, parity tooling, manifests, migration documentation, and Site-specific tests belong in the Sites repository. Demo behavior, visuals, audio, controls, physics, and runtime assets belong here first.

When both repositories change, keep this order:

```text
authoritative work
→ authoritative test
→ push GitHub main
→ sync Sites
→ parity and validation
→ Sites checkpoint
→ production verification
```

## Cache behavior

The deployed Site currently serves HTML with `Cache-Control: public, max-age=0, must-revalidate`. A new navigation revalidates the document, but an already-open mobile Safari tab can continue running its loaded page until it is reloaded or reopened. A revision query string may be used for manual verification, but it is not a substitute for a successful checkpoint and deployment-status check.
