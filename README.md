# Hadrian Pocket Detection

A simple project that identifies “pocket” features in a 3D mesh by grouping faces connected via _concave_ edges. It then visualizes these pockets in a React/TypeScript application with a 3D viewer.

---

## Files

- **`colored_glb.glb`**  
  A glTF file containing the 3D model, where each face (entity) is assigned a unique color.

- **`adjacency_graph.json`**  
  Maps each `entityId` to a set of neighboring `entityIds`.

- **`adjacency_graph_edge_metadata.json`**  
  Provides “concave,” “convex,” or “tangent” metadata for each shared edge between faces.

- **`rgb_id_to_entity_id_map.json`**  
  Translates a face color (`rgbId`) to an `entityId`.

- **`entity_geometry_info.json`**  
  Additional geometry metadata for each face (optional for the pocket-detection logic).

---

## Goal

1. **Parse Data**  
   - Load all JSON metadata and link each face (color in `.glb`) to its `entityId`.  
2. **Detect Pockets**  
   - Identify sets of faces connected exclusively by _concave_ edges (using BFS or DFS on the “concave-only” graph).  
3. **Visualize**  
   - Render each pocket cluster distinctly in the 3D viewer for quick and easy evaluation.

---

## Quick Start

1. **Installation**  
   ```bash
   npm install
