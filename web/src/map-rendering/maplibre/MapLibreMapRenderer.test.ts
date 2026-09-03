import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mapConfig } from '../../features/map/config/mapConfig';
import { BuildingFloor, Coordinate, Location } from '../../routing/types';
import {
	motionDuration,
	routeBoundsCameraOptions,
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

	it('recenters user location smoothly without changing heading', () => {
		expect(userLocationCameraOptions({
			latitude: 43.4723,
			longitude: -80.5449,
			accuracy: 12
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
			source.indexOf('useEffect(() => {\n\t\tsetPaintProperty')
		);
		const displayRouteBlock = source.slice(
			source.indexOf('displayRoute: route =>'),
			source.indexOf('recenterUserLocation: position =>')
		);

		expect(displayRouteBlock).toContain('fitRouteBounds(mapRef.current, route)');
		expect(routeSourceEffect).toContain('[displayedRoute, highlightedDirection]');
		expect(routeSourceEffect).not.toContain('fitRouteBounds');
		expect(routeSourceEffect).not.toContain('easeTo');
	});
});
