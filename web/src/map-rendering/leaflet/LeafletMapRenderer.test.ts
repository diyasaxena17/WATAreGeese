import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('LeafletMapRenderer', () => {
	const source = readFileSync(resolve(__dirname, 'LeafletMapRenderer.tsx'), 'utf8');
	const layersSource = readFileSync(resolve(__dirname, 'LeafletMapLayers.tsx'), 'utf8');

	it('renders campus data through selectors instead of raw GeoJSON imports', () => {
		expect(layersSource).toContain('getBuildingOutlines');
		expect(layersSource).toContain('getPathFeatures');
		expect(layersSource).not.toContain('buildings.json');
		expect(layersSource).not.toContain('paths.json');
	});

	it('keeps Leaflet tile configuration centralized', () => {
		expect(source).toContain('mapConfig.tileUrl');
		expect(source).toContain('mapConfig.attribution');
		expect(source).not.toContain('tile.openstreetmap.org');
	});

	it('does not calculate routes in the renderer', () => {
		expect(source).not.toContain('calculateRoute');
		expect(source).not.toContain('new Dijkstra');
		expect(source).not.toContain('new AdjacencyList');
	});

	it('renders current user location from normalized location data', () => {
		expect(source).toContain('UserLocationMarker');
		expect(source).toContain('userPosition');
		expect(source).toContain('recenterUserLocation');
		expect(source).not.toContain('navigator.geolocation');
	});
});
