# WATAreGeese Architecture

## Map Stack

```text
React
  -> map-rendering abstraction
  -> MapLibre active renderer
  -> Leaflet fallback renderer
  -> configurable OSM-compatible tiles
  -> soft basemap
  -> WATAreGeese campus layers
```

The active map renderer is exposed through `web/src/map-rendering`. Application
screens should use the renderer boundary instead of importing MapLibre or
Leaflet directly.

Tile provider configuration lives in
`web/src/features/map/config/mapConfig.ts`. The default development provider is
OpenStreetMap-compatible and does not require an API key or payment account.
Phase 1 MapLibre camera settings, route camera padding, and simple building
extrusion defaults also live in this config.

## Navigation Flow

```text
building selection
  -> NavigationService
  -> custom routing graph / Dijkstra
  -> RouteResult
  -> renderer abstraction
  -> MapLibre visualization
```

MapLibre renders campus data, calculated route geometry, markers, direction
highlighting, and Phase 1 camera movement. It does not calculate paths. Routing,
navigation, and campus-data modules do not import MapLibre or Leaflet.

## Location Flow

```text
explicit user action
  -> useUserLocation
  -> BrowserGeolocationService
  -> navigator.geolocation
  -> UserPosition
  -> active renderer user-location marker / recenter
```

Location remains in memory in the browser. WATAreGeese does not store location
history, does not send location to routing services, and does not use GPS as a
routing endpoint yet.

## Campus Data

Raw inherited GeoJSON remains under `web/src/campus-data`. Consumers should use
typed selectors from the campus-data module rather than importing or filtering
raw files directly.
