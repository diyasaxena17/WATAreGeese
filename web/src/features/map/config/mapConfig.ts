export const mapConfig = {
	center: [43.4718, -80.543] as [number, number],
	defaultZoom: 16,
	userLocationZoom: 17,
	minZoom: 14,
	maxBounds: [
		[43.3, -80.7],
		[43.6, -80.3]
	] as [[number, number], [number, number]],
	tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maplibre: {
		camera: {
			defaultPitch: 48,
			defaultBearing: -20,
			maxPitch: 62,
			defaultZoom: 16.2,
			routeZoom: 16.8,
			selectedBuildingZoom: 18,
			userLocationZoom: 17.2,
			animationDurationMs: 800,
			routeBoundsPadding: 96
		},
		buildings: {
			extrusionBaseHeight: 0,
			defaultExtrusionHeight: 18
		},
		terrain: {
			enabled: true,
			sourceId: 'mapzen-terrain-dem',
			tileUrl: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
			attribution: 'Elevation tiles &copy; Mapzen',
			tileSize: 256,
			maxzoom: 15,
			encoding: 'terrarium' as const,
			exaggeration: 1.15
		}
	}
};
