# WATAreGeese Web

WATAreGeese uses React, TypeScript, Vite, Tailwind, Leaflet, and the inherited
Waterloo campus routing data.

## Local Development

Install dependencies and start Vite:

```sh
npm install
npm run dev
```

The active map stack uses configurable OpenStreetMap-compatible tiles through
Leaflet. Local development does not require a Google Maps key or any mapping API
key.

## Tests

Run the regression suite with:

```sh
npm test
```

The tests exercise campus-data selectors, building search, UI behavior, map
configuration, and the inherited WATIsGrass routing engine using the checked-in
campus GeoJSON data.

## Build

```sh
npm run build
```
