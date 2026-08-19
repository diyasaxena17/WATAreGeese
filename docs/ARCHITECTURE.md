# WATAreGeese Architecture

## Map Stack

```text
React
  -> Leaflet
  -> configurable OSM-compatible tiles
  -> WATAreGeese campus layers
```

The active map renderer is exposed through `web/src/map-rendering`. Application
screens should use the renderer boundary instead of importing Leaflet directly.

Tile provider configuration lives in
`web/src/features/map/config/mapConfig.ts`. The default development provider is
OpenStreetMap-compatible and does not require an API key or payment account.

## Navigation Flow

```text
building selection
  -> NavigationService
  -> custom routing graph / Dijkstra
  -> RouteResult
  -> Leaflet visualization
```

Leaflet renders campus data and calculated route geometry. It does not calculate
paths. Routing, navigation, and campus-data modules do not import Leaflet.

## Campus Data

Raw inherited GeoJSON remains under `web/src/campus-data`. Consumers should use
typed selectors from the campus-data module rather than importing or filtering
raw files directly.
