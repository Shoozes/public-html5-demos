# Public HTML5 Demos

A public GitHub Pages collection for browser-ready HTML-all-in-one demos, experiments, visual explainers, and prototypes.

- Gallery: https://shoozes.github.io/public-html5-demos/
- Anthrocybernetics demo: https://shoozes.github.io/public-html5-demos/anthrocybernetics/

## Repository contract

Each published demo uses one stable folder and one canonical entry file:

```text
demo-slug/
└── index.html
```

HAIO is the default. Keep HTML, CSS, and JavaScript in `index.html` when practical. A demo may use pinned HTTPS CDN dependencies. Add local assets only when embedding them would make the file impractical.

## Publishing a demo

1. Create a lowercase kebab-case folder such as `my-demo/`.
2. Place the complete playable file at `my-demo/index.html`.
3. Use relative paths for any local assets.
4. Add the demo to the root `index.html` gallery.
5. Commit to `main`.

GitHub Pages publishes directly from the repository root on `main`. No proxy, package installation, build command, or deployment workflow is required.

The resulting URL is:

```text
https://shoozes.github.io/public-html5-demos/my-demo/
```

## Demo requirements

- Runs from HTTPS without a development server.
- Contains no API keys, tokens, private endpoints, or user secrets.
- Pins CDN package versions rather than using floating `latest` URLs.
- Works on current desktop and mobile browsers.
- Handles portrait and landscape layouts where relevant.
- Provides a readable fallback when WebGL, WebGPU, or a CDN dependency fails.
- Avoids absolute repository-root paths so project-page URLs keep working.
- Uses a clear title, description, and primary action.

## Current demos

### Soldier Ragdoll Lab

A mobile- and desktop-friendly Three.js physics playground using the local Soldier GLB asset. Grab and throw the character, orbit the scene, or reset the ragdoll. Its rigid neck/head link, framed limb hinges, selective head collision, and higher solver budget keep the figure proportionate during limb holds. It includes optional music and sound effects, enabled from a tap-to-start splash screen. Share the authoritative GitHub Pages version at [Soldier Ragdoll Lab](https://shoozes.github.io/public-html5-demos/ragdoll-lab/) or the additional [ChatGPT Site](https://ragdoll-physics-demo.shoozes.chatgpt.site). Agents must follow the scoped [ragdoll deployment workflow](ragdoll-lab/DEPLOYMENT.md) when changing or deploying it.

### Anthrocybernetics Guided Demo

A mobile-first interactive presentation explaining feedback loops, the five observation lenses, evidence labels, and what actually moves when a cloud agent is ported to a local model.

Open it at `anthrocybernetics/index.html` or through the public gallery.
