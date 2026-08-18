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
});
