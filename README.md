# WATAreGeese

WATAreGeese is an [VERY MUCH still in progress] unofficial Waterloo indoor-routing project for finding paths through campus buildings, tunnels, bridges, hallways, stairs, doors, open connections, and outdoor walkways.

Built upon and inspired by the open-source work of WATIsGrass and WATisRain [THANK YOU!!].

Check out the map here: wataregeese.vercel.app/

## Project philosophy

WATAreGeese aims to preserve the useful Waterloo indoor-routing work from previous projects while modernizing the UX and building toward features such as GPS and route preferences.

### Some fun stuff

- WATAreGeese is whimsy, so i try to keep adding fun elements
- tried to implement the hat tile shape across the front end: harder than i thought it would be turns out.
- i made the tiling pink and purple to rep the Math and Eng Fac colours

## Project lineage

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



## Development Status

This project is an active early prototype. The inherited routing engine is covered by regression tests, the map stack has moved to Leaflet, building search and route preferences are in place, and the app is deployed for public testing.

Still in progress:

- improving route quality and floor-aware behavior
- polishing the mobile route-selection and directions experience
- refining the Hat monotile visual system
- expanding GPS/current-location features without using GPS as a routing start point yet
- continuing to validate inherited Waterloo campus data


## License

WATAreGeese preserves the existing GNU General Public License v3.0 licensing. See [LICENSE](LICENSE).

Additional attribution and inherited-work notices are documented in [CREDITS.md](CREDITS.md) and [NOTICE.md](NOTICE.md).
