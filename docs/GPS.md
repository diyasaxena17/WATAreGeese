# GPS And Current Location

WATAreGeese supports current-location display as an optional client-side feature.

- Location is requested only after explicit user action.
- Browser geolocation is wrapped by `web/src/features/location`.
- The app stores location state in memory only.
- Location history is not stored in local storage, cookies, a database, or the URL.
- Location is not sent to external routing services.
- Building-to-building routing works without location permission.

Current location can be shown on the Leaflet map and used to recenter the
viewport. GPS coordinates are not routing endpoints yet and are not snapped into
the campus routing graph.
