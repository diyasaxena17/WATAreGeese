# WATAreGeese

WATAreGeese is an unofficial University of Waterloo indoor-routing app for finding paths through campus buildings, tunnels, bridges, hallways, stairs, doors, open connections, and outdoor walkways.

It is very much still in progress. The public test deployment is available at:

https://wataregeese.vercel.app/

WATAreGeese is built upon and inspired by the open-source work of WATisRain and WATIsGrass. Thank you to those projects and their contributors.

## Current State

The main app lives in `web/`. It is a React, TypeScript, Vite, Tailwind, MapLibre, and Leaflet project using inherited Waterloo campus routing data.

Current capabilities include:

- building and floor search for Waterloo campus routing endpoints
- building-to-building route calculation through the inherited campus graph
- a tunnelling preference that can prefer indoor/covered paths or choose the shortest route
- step-by-step directions with route highlighting
- a responsive map-first interface with a desktop side panel and mobile bottom sheet
- optional current-location display and recentering after explicit browser permission
- MapLibre as the active renderer, with Leaflet kept as a recovery/fallback renderer
- public, OpenStreetMap-compatible basemap tiles with no required map API key
- regression tests for routing, campus-data selectors, search, location behavior, UI, and map rendering

The `mobile/` directory contains a Cordova wrapper and app assets for Android/iOS packaging. The web app is the primary development target.

## Project Lineage

```text
WATisRain
https://github.com/lucky-bai/WATisRain

-> WATIsGrass
https://github.com/rickyqin005/WATIsGrass

-> WATAreGeese
```

WATisRain, created by Lucky Bai and contributors, established important earlier Waterloo campus-navigation work. WATIsGrass, created by Ricky Qin and contributors, built on that history with Waterloo bridge and tunnel routing. WATAreGeese is derived technically from WATIsGrass and inspired historically by both projects.

WATAreGeese is not an official successor to either project.

## Repository Layout

```text
web/      React/Vite web app, routing logic, campus data, map renderers, tests
mobile/   Cordova wrapper, mobile config, generated mobile assets
docs/     Architecture, GPS/privacy, map-rendering, UI, and Codex notes
```

Useful docs:

- [Architecture](docs/ARCHITECTURE.md)
- [Map rendering](docs/MAP_RENDERING.md)
- [GPS and current location](docs/GPS.md)
- [UI](docs/UI.md)
- [Credits](CREDITS.md)
- [Notice](NOTICE.md)

## Local Development

Install and run the web app:

```sh
cd web
npm install
npm run dev
```

Run tests:

```sh
cd web
npm test
```

Run the production build:

```sh
cd web
npm run build
```

Other available web scripts:

```sh
npm run lint
npm run preview
```

## Development Status

This project is an active prototype. The routing engine, campus-data access, location wrapper, renderer boundaries, and main UI flows have test coverage, and the app is deployed for public testing.

Still in progress:

- improving route quality and floor-aware behavior
- polishing mobile route selection and directions
- refining the Hat monotile visual system and brand details
- expanding current-location features without using GPS as a routing start point yet
- continuing to validate inherited Waterloo campus data
- hardening mobile packaging around the Cordova wrapper

## Some Fun Stuff

- WATAreGeese is whimsical by design, so small goose details are part of the project.
- The visual system experiments with the Hat monotile shape.
- Earlier pink and purple tiling experiments referenced Waterloo Math and Engineering faculty colors; the current UI is more map-first and restrained.

## License

WATAreGeese preserves the existing GNU General Public License v3.0 licensing. See [LICENSE](LICENSE).

Additional attribution and inherited-work notices are documented in [CREDITS.md](CREDITS.md) and [NOTICE.md](NOTICE.md).
