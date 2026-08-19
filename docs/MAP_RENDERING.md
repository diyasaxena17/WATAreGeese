# Map Rendering

The active WATAreGeese map stack is Leaflet.

```text
React
  -> Leaflet
  -> configurable OSM-compatible tiles
  -> WATAreGeese campus layers
```

## Active Files

- `web/src/map-rendering/index.ts` exports the active `useMapRenderer()`
  boundary.
- `web/src/map-rendering/leaflet/LeafletMapRenderer.tsx` owns the Leaflet map
  container and tile layer.
- `web/src/map-rendering/leaflet/LeafletMapLayers.tsx` renders campus overlays,
  selected location markers, calculated routes, and direction highlighting.
- `web/src/features/map/config/mapConfig.ts` centralizes map center, zoom,
  bounds, tile URL, and attribution.

## Rules

- Application pages should not import Leaflet directly.
- Routing, navigation, and campus-data modules must not import Leaflet.
- Tile URLs and attribution must come from `mapConfig`.
- Leaflet renders `RouteResult` geometry; it must not calculate paths.
