# Round 4 Implementation Decisions

- I will take “slightly oblique tactical camera” as a fixed-yaw orthographic camera pitched enough to show hull height and lighting, with a stable 46-world-unit vertical span and no target-driven zoom.
- I will take “aggressive hostile” as a hostile that has crossed a delayed proximity threshold or has been explicitly provoked. The encounter cannot arm before 3.2 seconds after the first frame.
- I will take “sticky target lock” as nearest-target acquisition only when no valid lock exists, with a 22-unit acquisition radius and a larger 29-unit break radius.
- I will take “manual disengagement” as a 3-second per-target suppression plus a requirement that the target leave acquisition range before suppression is cleared early.
- I will take “magnetic salvage” as a 0.8-second readable free-flight phase followed by spring-smoothed attraction inside 11 units and automatic collection inside 1.7 units.
- I will take “compact HUD” as edge-mounted translucent status groups, a short event feed, and contextual controls that stay hidden until they have a real action.
- I will take “sector visual language” as industrial teal navigation lighting against violet hostile accents, with named large silhouettes, anchored debris, a star field, and a subtle world grid.
- I will take “world-state architecture” as an ECS-lite authoritative entity map keyed by numeric IDs, with staged spawn/destruction queues and a separate render-object registry.
- I will take “portable HTML” as a single HTML document with inline CSS and JavaScript; the only network runtime dependencies are pinned Three.js 0.185.1 ESM modules from jsDelivr.
- I will take “restart” as full world teardown and reconstruction while retaining the one renderer and one animation loop.

These decisions were written before the implementation. Testing may refine numeric thresholds, but not weaken the behavioral invariants above.
