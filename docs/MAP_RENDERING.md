# Map Rendering

The active WATAreGeese map stack is MapLibre GL JS. Leaflet remains in the
codebase as a fallback renderer while the Phase 1 migration settles.

```text
React
  -> map-rendering abstraction
  -> MapLibre active renderer
  -> Leaflet fallback renderer
  -> configurable OSM-compatible tiles
  -> soft MapLibre basemap style
  -> WATAreGeese campus layers
  -> existing routing engine / Dijkstra
```

## Active Files

- `web/src/map-rendering/index.ts` exports the active `useMapRenderer()`
  boundary.
- `web/src/map-rendering/maplibre/MapLibreMapRenderer.tsx` owns the active
  MapLibre map instance and Phase 1 camera behaviour.
- `web/src/map-rendering/maplibre/mapStyle.ts` defines the soft, low-noise
  basemap style.
- `web/src/map-rendering/maplibre/MapLibreMapLayers.ts` defines MapLibre campus
  building, path, route, and marker layer data.
- `web/src/map-rendering/leaflet/LeafletMapRenderer.tsx` owns the Leaflet map
  container and tile layer for fallback use.
- `web/src/features/map/config/mapConfig.ts` centralizes map center, zoom,
  bounds, MapLibre camera values, tile URL, and attribution.

## Rules

- Application pages should not import MapLibre or Leaflet directly.
- Routing, navigation, and campus-data modules must not import MapLibre or
  Leaflet.
- Tile URLs and attribution must come from `mapConfig`.
- MapLibre renders existing campus GeoJSON and `RouteResult` geometry; it must
  not calculate paths.
- The renderer may own camera behaviour such as the pitched initial view,
  route fit-bounds, and recentering. It must not create a second navigation
  state system.
- No paid map token or secret API key is required for the Phase 1 basemap.
