# Codex Notes

## Project Boundaries

- Do not modify raw campus GeoJSON unless the task explicitly requires data
  migration.
- Do not change Dijkstra weighting or route behavior without updating routing
  regression tests.
- Use the campus-data selectors for campus features.
- Use `NavigationService` as the UI-facing routing boundary.
- Use `web/src/map-rendering` as the UI-facing map boundary.
- Do not request current location on app startup. Location requests must follow
  explicit user action and stay client-side.

## Map Architecture

```text
React
  -> Leaflet
  -> configurable OSM-compatible tiles
  -> WATAreGeese campus layers
```

Tile URLs and attribution belong in `web/src/features/map/config/mapConfig.ts`,
not in renderer components. The default development map stack does not require a
Google Maps key or any mapping API key.

## Location Architecture

`web/src/features/location` owns browser geolocation access and normalized
location state. Map rendering may display a normalized `UserPosition`, but
routing must not snap GPS coordinates into the graph or route from GPS yet.

## Validation

For web changes, run from `web/`:

```sh
npm test
npm run build
npm run lint
```

The lint command currently includes inherited historical failures. Do not fix
unrelated lint debt unless the task asks for it.
