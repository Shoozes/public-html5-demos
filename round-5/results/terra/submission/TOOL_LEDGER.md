# Round 5A Tool Ledger

## Frozen preflight

- Package integrity: `node round-5/harness/verify-package.mjs` — passed on the dispatch commit `1aa2761d8d091c687f91d83bcd02a1efd8b67a59`.
- Visual interpreter: native image view only, as frozen by `round-5/EXPERIMENT.json`.
- Browser lane: Playwright `1.62.1` resolved from `C:\Users\jc816\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules` through `CODEX_NODE_MODULES`.
- Browser executable: `C:\Program Files\Google\Chrome\Application\chrome.exe` (frozen Chrome/default-browser lane).
- Desktop target: 1440×900. Portrait target: 390×844.
- Reference inspection: both approved V2 PNGs were opened with native image view before implementation. They remain unmodified.
- Visual-critic procedure: `.agents/skills/haio-visual-critic/SKILL.md` was read in full and is used for deterministic capture, semantic review, bounded repairs, and before/after evidence.

## Runtime and evidence commands

Commands, browser backend, console/network observations, screenshot paths, and pass/fail results are appended to `EVIDENCE.md` as they are run. No generated mockup or compositor screenshot is used as proof of the game.
