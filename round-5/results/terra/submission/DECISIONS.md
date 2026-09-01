# Material Decisions

- I will take the V2 cyan/coral/amber/green value hierarchy as the visual target while using original procedural low-poly assemblies.
- I will take local ship forward to be negative Z, with logical cardinal facing recorded independently from weapon aim.
- I will take stable numeric IDs in the entity map as world authority; scene groups only represent entities.
- I will take a fixed-yaw oblique, player-following tactical camera so movement is visible without target zoom.
- I will take opening safety to mean hostiles cannot become aggressive or fire until the three-second no-input window ends.
- I will take combat targeting to mean nearest aggressive hostile in range, with a longer break range and a temporary disengage suppression.
- I will take salvage to mean ordinary drops burst out, wait briefly, magnetize, and award exactly five credits once at close range.
- I will take restart to mean reconstructing the sector state in the existing renderer and animation loop, never treating a combat death as teardown.
- I will take compact HUD panels as informational edges; only station selection reveals a contextual action.
