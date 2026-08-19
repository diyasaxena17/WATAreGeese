# WATAreGeese

WATAreGeese is an unofficial Waterloo indoor-routing project for finding paths through campus buildings, tunnels, bridges, hallways, stairs, doors, open connections, and outdoor walkways.

Built upon and inspired by the open-source work of WATIsGrass and WATisRain.

## Project Lineage

WATAreGeese follows this project lineage:

```text
WATisRain
https://github.com/lucky-bai/WATisRain

-> WATIsGrass
https://github.com/rickyqin005/WATIsGrass

-> WATAreGeese
```

WATisRain, created by Lucky Bai and contributors, established important earlier Waterloo campus-navigation work. WATIsGrass, created by Ricky Qin and contributors, built on that history with Waterloo bridge and tunnel routing. WATAreGeese is derived technically from WATIsGrass and inspired historically by both projects.

WATAreGeese is not an official successor to either project.

## Project Philosophy

WATAreGeese aims to preserve the useful Waterloo indoor-routing work from previous projects while modernizing the user experience and building toward features such as location awareness and route preferences.

## Unofficial Status

WATAreGeese is an unofficial community project. It is not affiliated with, endorsed by, or sponsored by the University of Waterloo.

## Development Status

This project is in active early development. The inherited routing engine and campus data are being stabilized with regression tests before larger product or UI changes are made.

## Local Development

Install dependencies and run the web app:

```sh
cd web
npm install
npm run dev
```

The development map uses configurable OpenStreetMap-compatible tiles through
Leaflet and does not require a Google Maps key or any mapping API key.

Run tests:

```sh
cd web
npm test
```

Build for production:

```sh
cd web
npm run build
```

## License

WATAreGeese preserves the existing GNU General Public License v3.0 licensing. See [LICENSE](LICENSE).

Additional attribution and inherited-work notices are documented in [CREDITS.md](CREDITS.md) and [NOTICE.md](NOTICE.md).
