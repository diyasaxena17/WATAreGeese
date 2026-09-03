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

## Terrain Evaluation

Phase 2 also evaluated whether MapLibre terrain should be added to the campus
map. The decision is to defer terrain.

Sources investigated:

- Existing map configuration and renderer code.
- Existing campus GeoJSON and route geometry.
- Public elevation samples around the current campus experience bounds, queried
  from Open-Elevation on 2026-09-03.
- University of Waterloo Weather Station location information:
  https://weather.uwaterloo.ca/info.html
- University of Waterloo campus and elevation dataset listings:
  https://uwaterloo.ca/lib-geospatial/collections/canadian-geospatial-data-resources/university-waterloo-campus
  and
  https://uwaterloo.ca/lib-geospatial/collections/canadian-geospatial-data-resources/ontario/lidar-cloud-point-and-raster-elevation-data
- MapLibre terrain documentation:
  https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/#setterrain
  and
  https://maplibre.org/maplibre-style-spec/sources/#raster-dem

Findings:

- The current WATAreGeese campus data has 2D route geometry and building
  outline geometry. It does not include terrain elevation, per-coordinate
  elevation, slope, stairs-as-terrain, or accessibility grade metadata.
- Public elevation samples across the core campus experience were approximately
  334 m to 343 m above sea level. That modest variation is unlikely to improve
  comprehension of building-to-building indoor/outdoor routing.
- The UW Weather Station page reports 334.4 m above sea level for a nearby
  north-campus station, which is consistent with the sampled elevation range.
- Authoritative UW/Geospatial Centre elevation and LiDAR datasets exist, but
  their listed access and use restrictions are not a clean fit for direct
  public-app integration.
- MapLibre terrain requires an additional `raster-dem` source and DEM tile
  network requests. The style specification supports raster DEM sources, but
  adding one would introduce another external tile dependency, attribution
  requirements, renderer failure cases, and extra GPU/mobile rendering cost.
- Terrain would not change routing geometry under the project constraints, so
  it would be a visual-only layer. On a relatively flat campus, that visual
  complexity risks making buildings, labels, route lines, and markers harder to
  scan.

Conclusion:

Do not add terrain for Phase 2. The current pitched MapLibre view and restrained
building extrusions provide useful spatial context without adding DEM tile
requests or mobile/GPU cost. Terrain can be reconsidered later only if a
clearly licensed DEM source and a route-relevant use case appear, such as
meaningful slope/grade communication for accessible outdoor routing. Any future
terrain work must preserve route geometry and degrade gracefully to the existing
renderer fallback path.
