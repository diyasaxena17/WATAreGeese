# Map Rendering Audit

Issue #9 starts the move away from direct Google Maps coupling. The active
renderer now uses Leaflet for the basemap, campus overlays, location markers,
calculated routes, and direction highlighting. Google-specific code is retained
as inherited compatibility code until later cleanup removes it.

## Current Google-specific Code

- `web/src/map-rendering/google/GoogleMapRenderer.tsx` contains the inherited
  Google renderer implementation, but it is no longer the active renderer.
- `web/src/map-rendering/leaflet/LeafletMapRenderer.tsx` owns the active
  Leaflet renderer boundary.
- `web/src/map-rendering/leaflet/LeafletMapLayers.tsx` renders campus overlays,
  selected location markers, calculated route geometry, and direction-step
  highlighting.
- `web/src/features/map/config/mapConfig.ts` centralizes the map center, zoom,
  bounds, tile URL, and attribution.
- `web/src/map/loadMap.ts` loads the Google Maps JavaScript API and creates the
  base map.
- `web/src/hooks/useGoogleMapsLibrary.ts` imports Google Maps libraries.
- `web/src/hooks/useBaseGeoJson.ts` renders campus paths and building outlines
  as Google polylines/polygons.
- `web/src/map/displayRoute.ts` renders route polylines.
- `web/src/map/updateLocation.ts` manages start/end Google Advanced Markers.
- `web/src/map/formatPolyLine.ts` and `web/src/map/formatPolygon.ts` return
  Google rendering options.
- `web/src/map/GoogleMapsLibrary.ts` aliases Google library types.
- `web/src/components/DirectionsListItem.tsx` highlights route segments using
  Google marker/polyline objects.
- `web/src/routing/types.ts` still exposes `Coordinate.toGoogleMapsCoordinate()`
  as inherited compatibility code.

## UI Components With Google Coupling

- `DirectionsListItem` still depends on Google map objects for hover and active
  route highlighting, but the active Leaflet renderer now provides direction
  item rendering through the renderer boundary.

Home screen application code now talks to `useMapRenderer()` instead of importing
Google or Leaflet APIs directly.

## Generic Map Concepts

- Campus map canvas
- Base campus path/building layers
- Start and destination markers
- Route polyline rendering
- Direction-step highlighting
- Route display cleanup
- Tile URL and attribution configuration

## Google-specific Implementations

- Script loading and library import
- Google `Map`, `Polyline`, `Polygon`, and `AdvancedMarkerElement`
- Google coordinate option objects
- Current marker pin styling

## Leaflet-specific Implementation

- React Leaflet `MapContainer` and `TileLayer`
- OpenStreetMap-compatible development tile URL
- OpenStreetMap attribution display
- Campus path and building outline layers from campus-data selectors
- Route polylines from `Route.graphLocations[*].path`
- Renderer-neutral highlighted direction index feeding Leaflet layers

## Target Direction

`HomePage` and navigation features should depend on `web/src/map-rendering`
only. Routing, navigation, and campus-data modules remain independent from
Leaflet.
