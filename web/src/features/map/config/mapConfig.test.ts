import { describe, expect, it } from 'vitest';

import { mapConfig } from './mapConfig';

describe('mapConfig', () => {
	it('centralizes the development tile source and attribution', () => {
		expect(mapConfig.tileUrl).toContain('openstreetmap.org');
		expect(mapConfig.attribution).toContain('OpenStreetMap');
		expect(mapConfig.center).toEqual([43.4718, -80.543]);
		expect(mapConfig.defaultZoom).toBe(16);
		expect(mapConfig.userLocationZoom).toBe(17);
	});

	it('centralizes calm MapLibre camera defaults for Phase 1', () => {
		expect(mapConfig.maplibre.camera.defaultPitch).toBeGreaterThanOrEqual(45);
		expect(mapConfig.maplibre.camera.defaultPitch).toBeLessThanOrEqual(50);
		expect(mapConfig.maplibre.camera.defaultBearing).toBe(-20);
		expect(mapConfig.maplibre.camera.maxPitch).toBeGreaterThanOrEqual(60);
		expect(mapConfig.maplibre.camera.maxPitch).toBeLessThanOrEqual(65);
		expect(mapConfig.maplibre.camera.defaultZoom).toBeGreaterThan(mapConfig.defaultZoom);
	});

	it('keeps future MapLibre route and building camera values explicit', () => {
		expect(mapConfig.maplibre.camera.routeZoom).toBeGreaterThan(mapConfig.maplibre.camera.defaultZoom);
		expect(mapConfig.maplibre.camera.selectedBuildingZoom).toBeGreaterThan(mapConfig.maplibre.camera.routeZoom);
		expect(mapConfig.maplibre.camera.routeBoundsPadding).toBeGreaterThan(0);
		expect(mapConfig.maplibre.camera.mobileRouteBoundsPadding.bottom).toBeGreaterThan(
			mapConfig.maplibre.camera.mobileRouteBoundsPadding.top
		);
		expect(mapConfig.maplibre.camera.animationDurationMs).toBeGreaterThan(0);
	});

	it('uses restrained placeholder building extrusion values without metadata', () => {
		expect(mapConfig.maplibre.buildings.extrusionBaseHeight).toBe(0);
		expect(mapConfig.maplibre.buildings.defaultExtrusionHeight).toBeGreaterThan(0);
		expect(mapConfig.maplibre.buildings.defaultExtrusionHeight).toBeLessThanOrEqual(20);
	});

	it('centralizes optional MapLibre terrain as a subtle rendering concern', () => {
		expect(mapConfig.maplibre.terrain).toMatchObject({
			enabled: true,
			sourceId: 'mapzen-terrain-dem',
			tileUrl: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
			attribution: 'Elevation tiles &copy; Mapzen',
			tileSize: 256,
			maxzoom: 15,
			encoding: 'terrarium'
		});
		expect(mapConfig.maplibre.terrain.exaggeration).toBeGreaterThanOrEqual(1);
		expect(mapConfig.maplibre.terrain.exaggeration).toBeLessThanOrEqual(1.3);
	});
});
