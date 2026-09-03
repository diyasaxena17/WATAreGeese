import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('HomePage routing boundary', () => {
	it('uses the navigation service instead of constructing routing internals', () => {
		const source = readFileSync(resolve(__dirname, 'HomePage.tsx'), 'utf8');

		expect(source).toContain("import { NavigationService } from '../features/navigation/navigationService'");
		expect(source).toContain('navigationService.calculateRoute');
		expect(source).not.toContain('new Dijkstra');
		expect(source).not.toContain('new AdjacencyList');
		expect(source).not.toContain('getRoutingGeoJson');
	});

	it('uses the map renderer boundary instead of Google map APIs directly', () => {
		const source = readFileSync(resolve(__dirname, 'HomePage.tsx'), 'utf8');

		expect(source).toContain("import { useMapRenderer } from '../map-rendering'");
		expect(source).toContain('useMapRenderer(hasRoute, highlightedDirection, userLocation.position)');
		expect(source).not.toContain('google.maps');
		expect(source).not.toContain('useLoadMap');
		expect(source).not.toContain('useGoogleMapsLibrary');
		expect(source).not.toContain('useBaseGeoJson');
		expect(source).not.toContain("from '../map/displayRoute'");
		expect(source).not.toContain("from '../map/updateLocation'");
	});

	it('requests selected-building camera focus through the renderer boundary', () => {
		const source = readFileSync(resolve(__dirname, 'HomePage.tsx'), 'utf8');

		expect(source).toContain('mapRenderer.focusLocation(locationForBuilding(building, nextFloor, startEndLocations))');
		expect(source).not.toContain('easeTo');
		expect(source).not.toContain('fitBounds');
	});

	it('does not import renderer implementations directly', () => {
		const source = readFileSync(resolve(__dirname, 'HomePage.tsx'), 'utf8');

		expect(source).not.toContain('maplibre-gl');
		expect(source).not.toContain('../map-rendering/maplibre');
		expect(source).not.toContain('../map-rendering/leaflet');
	});

	it('keeps MapLibre as the active renderer and exposes Leaflet as fallback through the boundary', () => {
		const source = readFileSync(resolve(__dirname, '../map-rendering/index.ts'), 'utf8');

		expect(source).toContain("export { useMapLibreMapRenderer as useMapRenderer } from './maplibre/MapLibreMapRenderer'");
		expect(source).toContain("export { useLeafletMapRenderer } from './leaflet/LeafletMapRenderer'");
		expect(source).toContain("export { useMapLibreMapRenderer } from './maplibre/MapLibreMapRenderer'");
	});

	it('does not introduce Google, Mapbox, or paid-token map dependencies', () => {
		const packageJson = readFileSync(resolve(__dirname, '../../package.json'), 'utf8');
		const rendererSource = readFileSync(resolve(__dirname, '../map-rendering/index.ts'), 'utf8');

		expect(packageJson).toContain('"maplibre-gl"');
		expect(packageJson).not.toContain('google-map');
		expect(packageJson).not.toContain('mapbox-gl');
		expect(rendererSource).not.toContain('accessToken');
	});

	it('uses the location hook instead of navigator geolocation directly', () => {
		const source = readFileSync(resolve(__dirname, 'HomePage.tsx'), 'utf8');

		expect(source).toContain("import { LocationService, useUserLocation } from '../features/location'");
		expect(source).toContain('useUserLocation(locationService)');
		expect(source).not.toContain('navigator.geolocation');
	});
});
