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

## Building Height Data Evaluation

Phase 2 evaluated whether per-building extrusion heights should replace the
uniform placeholder height used by the MapLibre renderer. The decision is to
keep uniform heights for now.

Sources investigated:

- Existing WATAreGeese campus data in `web/src/campus-data/buildings.json` and
  `web/src/campus-data/paths.json`.
- Existing GeoJSON schema notes in `web/src/geojson/README.md`.
- OpenStreetMap building data for a University of Waterloo campus bounding box,
  queried through Overpass on 2026-09-03.
- University of Waterloo Geospatial Centre campus dataset listing:
  https://uwaterloo.ca/lib-geospatial/collections/canadian-geospatial-data-resources/university-waterloo-campus
- OpenStreetMap building-level tagging guidance:
  https://wiki.openstreetmap.org/wiki/Key:building:levels

Findings:

- The app's raw building outline features only contain `type` and `default`
  building/floor properties. The building point features only contain
  `buildingCode` and `floors`. There are no `height`, `building:levels`, or
  equivalent physical height properties in the repository data.
- The stair `level` values in the routing GeoJSON describe relative indoor
  floor transitions, not whole-building physical height.
- The UW Geospatial Centre lists building footprints and related campus layers,
  but access requires UW affiliation and a data release agreement. Its published
  page limits use to academic, research, teaching, and personal purposes, so it
  is not suitable for direct integration into this public app without a clearer
  license path.
- The OSM query returned some usable-looking `building:levels` tags, but only
  26 of the 40 current app building-outline codes matched OSM features with
  both `ref` and `building:levels`. Only 5 matching app codes had explicit
  `height` tags. Some records are ambiguous or conflicting for this use case;
  for example, DC appears with conflicting `building:levels` values.

Conclusion:

Do not add per-building heights yet. Partial OSM `building:levels` coverage
would force fallback assumptions for a large share of current outlines, and
converting levels to meters would still be approximate unless verified heights
exist. Mixing that approximation into the renderer would make the 3D campus
look more precise than the data supports. Uniform, restrained extrusion heights
remain preferable until a clearly licensed and complete metadata source can be
keyed to the app's existing `buildingCode` identifiers.

If verified data becomes available later, keep it separate from raw routing
GeoJSON, for example:

```text
existing building outline geometry
  + rendering metadata keyed by buildingCode
  -> MapLibre extrusion height expression
```

That metadata should remain renderer-only and must not affect Dijkstra, route
geometry, search ranking, or direction generation.
