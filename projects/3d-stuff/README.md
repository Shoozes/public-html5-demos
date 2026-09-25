# 3D stuff

Browser 3D scenes, physics demonstrations, rendering experiments and tools.
The category describes the work; each entry declares its implementation.

| Demo | Purpose | Current stack |
| --- | --- | --- |
| [Soldier Ragdoll Lab](ragdoll-lab/index.html) | Interactive rigid-body reference | Three.js 0.185.1; Rapier 0.20.0; WebGLRenderer |
| [Soldier Ragdoll Math Lab](ragdoll-math-lab/index.html) | Custom solver and behavior-parity study | Three.js 0.185.1; shared JavaScript/TypeScript math; WebGLRenderer |

These entries are not labeled WebGPU just because they use Three.js. Future
WebGPU/TSL demos may live here with their actual backend documented. Frozen
hostile-space experiment submissions remain under `rounds/` to preserve provenance.

Shared geometry/audio assets stay in `assets/`; shared solver and parity contracts
stay in `shared/`. Do not copy these into each project. See the
[deployment contract](ragdoll-lab/DEPLOYMENT.md),
[custom solver notes](ragdoll-math-lab/MATH.md) and
[cloning methodology](../../docs/parity/CLONE_BEHAVIOR_NOT_CONSTANTS.md).

[Open the category](index.html) · [All projects](../README.md)
