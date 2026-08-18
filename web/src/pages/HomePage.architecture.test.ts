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
		expect(source).toContain('useMapRenderer()');
		expect(source).not.toContain('google.maps');
		expect(source).not.toContain('useLoadMap');
		expect(source).not.toContain('useGoogleMapsLibrary');
		expect(source).not.toContain('useBaseGeoJson');
		expect(source).not.toContain("from '../map/displayRoute'");
		expect(source).not.toContain("from '../map/updateLocation'");
	});
});
