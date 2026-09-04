import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mapConfig } from '../../features/map/config/mapConfig';
import { BuildingFloor, Coordinate, Location } from '../../routing/types';
import { mapLibreVisualTheme } from './MapLibreMapLayers';
import {
	locationMarkersToGeoJson,
	motionDuration,
	isTerrainSourceError,
	projectRouteOverlay,
	routeStepFromEvent,
	routeBoundsCameraOptions,
	routeBoundsPadding,
	selectedBuildingToGeoJson,
	selectedBuildingCameraOptions,
	userLocationCameraOptions
} from './MapLibreMapRenderer';

describe('MapLibre camera intents', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('moves intentionally selected buildings with restrained pitched camera options', () => {
		const location = new Location(
			new Coordinate([-80.543, 43.4718]),
			new BuildingFloor({ buildingCode: 'DC', floor: '1' })
		);

		expect(selectedBuildingCameraOptions(location)).toMatchObject({
			center: [-80.543, 43.4718],
			zoom: mapConfig.maplibre.camera.selectedBuildingZoom,
			pitch: mapConfig.maplibre.camera.defaultPitch,
			bearing: mapConfig.maplibre.camera.defaultBearing,
			duration: mapConfig.maplibre.camera.animationDurationMs
		});
		expect(mapConfig.maplibre.camera.selectedBuildingZoom).toBeLessThanOrEqual(18);
	});

	it('frames active routes with configured pitch, bearing, zoom, and padding', () => {
		expect(routeBoundsCameraOptions()).toMatchObject({
			padding: mapConfig.maplibre.camera.routeBoundsPadding,
			maxZoom: mapConfig.maplibre.camera.routeZoom,
			pitch: mapConfig.maplibre.camera.defaultPitch,
			bearing: mapConfig.maplibre.camera.defaultBearing,
			duration: mapConfig.maplibre.camera.animationDurationMs
		});
	});

	it('uses extra bottom route padding on mobile so the directions sheet does not cover the route', () => {
		vi.stubGlobal('window', {
			matchMedia: vi.fn().mockReturnValue({ matches: true })
		});

		expect(routeBoundsPadding()).toEqual(mapConfig.maplibre.camera.mobileRouteBoundsPadding);
		expect(mapConfig.maplibre.camera.mobileRouteBoundsPadding.bottom)
			.toBeGreaterThan(mapConfig.maplibre.camera.mobileRouteBoundsPadding.top);
	});

	it('recenters user location smoothly without changing heading', () => {
		expect(userLocationCameraOptions({
			coordinates: {
				latitude: 43.4723,
				longitude: -80.5449
			},
			accuracyMeters: 12
		})).toEqual({
			center: [-80.5449, 43.4723],
			zoom: mapConfig.maplibre.camera.userLocationZoom,
			pitch: mapConfig.maplibre.camera.defaultPitch,
			duration: mapConfig.maplibre.camera.animationDurationMs
		});
	});

	it('uses immediate camera changes for reduced-motion users', () => {
		vi.stubGlobal('window', {
			matchMedia: vi.fn().mockReturnValue({ matches: true })
		});

		expect(motionDuration()).toBe(0);
	});

	it('ties route framing to displayRoute rather than highlight rerenders', () => {
		const source = readFileSync(resolve(__dirname, 'MapLibreMapRenderer.tsx'), 'utf8');
		const routeSourceEffect = source.slice(
			source.indexOf('useEffect(() => {\n\t\tupdateRouteSource'),
			source.indexOf('useEffect(() => {\n\t\tupdateLocationLabelSource')
		);
		const displayRouteBlock = source.slice(
			source.indexOf('displayRoute: route =>'),
			source.indexOf('recenterUserLocation: position =>')
		);

		expect(displayRouteBlock).toContain('fitRouteBounds(mapRef.current, route)');
		expect(displayRouteBlock).toContain('routeVisibleRef.current = routeVisible');
		expect(displayRouteBlock).toContain('applyRouteVisibilityMode(mapRef.current, routeVisible)');
		expect(routeSourceEffect).toContain('[displayedRoute, highlightedDirection]');
		expect(routeSourceEffect).not.toContain('fitRouteBounds');
		expect(routeSourceEffect).not.toContain('easeTo');
	});

	it('keeps route visibility mode synchronized with route state and map load', () => {
		const source = readFileSync(resolve(__dirname, 'MapLibreMapRenderer.tsx'), 'utf8');

		expect(source).toContain('<RouteScreenOverlay features={routeOverlay} />');
		expect(source).toContain('setRouteOverlay(projectRouteOverlay(mapRef.current, displayedRoute, highlightedDirection))');
		expect(source).toContain('applyRouteVisibilityMode(map, routeVisibleRef.current)');
		expect(source).toContain('const routeVisible = hasRoute || displayedRoute != null');
		expect(source).toContain('applyRouteVisibilityMode(mapRef.current, false)');
		expect(source).toContain("'fill-extrusion-opacity', campusBuildingExtrusionOpacity(routeVisible)");
	});

	it('projects the active route into a topmost screen overlay without changing coordinates', () => {
		const route = {
			graphLocations: [
				{ path: [[-80, 43]], travelMode: null },
				{ path: [[-80.1, 43.1], [-80.2, 43.2]], travelMode: null }
			]
		};
		const map = {
			project: vi.fn(([lng, lat]: [number, number]) => ({ x: lng + 100, y: lat + 200 }))
		};

		const overlay = projectRouteOverlay(map, route as never, 1);

		expect(map.project).toHaveBeenCalledWith([-80.1, 43.1]);
		expect(map.project).toHaveBeenCalledWith([-80.2, 43.2]);
		expect(overlay[0]).toMatchObject({
			kind: 'line',
			color: mapLibreVisualTheme.route.highlightColor,
			isHighlighted: true
		});
		expect(overlay[0].points[0][0]).toBeCloseTo(19.9);
		expect(overlay[0].points[0][1]).toBeCloseTo(243.1);
		expect(overlay[0].points[1][0]).toBeCloseTo(19.8);
		expect(overlay[0].points[1][1]).toBeCloseTo(243.2);
	});

	it('maps start, destination, and user position into distinguishable marker features', () => {
		const start = new Location(
			new Coordinate([-80.543, 43.4718]),
			new BuildingFloor({ buildingCode: 'DC', floor: '1' })
		);
		const end = new Location(
			new Coordinate([-80.541, 43.472]),
			new BuildingFloor({ buildingCode: 'MC', floor: '3' })
		);

		const geoJson = locationMarkersToGeoJson(start, end, {
			coordinates: {
				latitude: 43.4723,
				longitude: -80.5449
			},
			accuracyMeters: 24
		});

		expect(geoJson.features.map(feature => feature.properties)).toEqual([
			{ kind: 'start', glyph: 'S' },
			{ kind: 'end', glyph: 'D' },
			{ kind: 'user', glyph: '', accuracyMeters: 24 }
		]);
	});

	it('uses existing building outlines for selected-building styling', () => {
		const selected = new Location(
			new Coordinate([-80.543, 43.4718]),
			new BuildingFloor({ buildingCode: 'DC', floor: '1' })
		);

		const geoJson = selectedBuildingToGeoJson(selected);

		expect(geoJson.features.length).toBeGreaterThan(0);
		expect(geoJson.features.every(feature =>
			feature.properties.default.buildingCode == 'DC'
		)).toBe(true);
	});

	it('maps clicked route features back to direction step indices', () => {
		expect(routeStepFromEvent({
			features: [{ properties: { segmentIndex: 2 } }]
		} as never)).toBe(2);
		expect(routeStepFromEvent({
			features: [{ properties: { segmentIndex: '3' } }]
		} as never)).toBe(3);
		expect(routeStepFromEvent({
			features: [{ properties: { segmentIndex: 'not-a-step' } }]
		} as never)).toBeNull();
	});

	it('keeps terrain source errors inside the MapLibre renderer boundary', () => {
		expect(isTerrainSourceError({
			sourceId: mapConfig.maplibre.terrain.sourceId,
			error: new Error('DEM tile failed')
		}, mapConfig.maplibre.terrain.sourceId)).toBe(true);
		expect(isTerrainSourceError({
			sourceId: 'basemap',
			error: new Error('basemap tile failed')
		}, mapConfig.maplibre.terrain.sourceId)).toBe(false);
	});
});
