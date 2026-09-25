# Active projects

Maintained demos are grouped by what they demonstrate. Choose one canonical
category and record libraries/rendering backends in the project's description.

| Category | Scope | Current projects |
| --- | --- | --- |
| [3D stuff](3d-stuff/README.md) | 3D scenes, physics, rendering and tools | Soldier Ragdoll Lab; Soldier Ragdoll Math Lab |

Use `projects/<category>/<demo>/index.html` for new entries. `3d-stuff` can contain
Three.js, WebGL or WebGPU work; those labels do not require duplicate folders.
Add another category only when an actual project needs it. Do not move historical
benchmark submissions out of their owning `rounds/` folder.

Retired projects belong in [the-gravyard](../the-gravyard/README.md). Old project
paths that contain only generated redirects are compatibility entries, not active
projects. The root `ragdoll-lab/index.html` is also a generated source export for
the separate Site sync. Edit the categorized source and refresh compatibility
files with `node tools/sync-legacy-routes.mjs`.
