import { describe, expect, it } from 'vitest';

import { getHatClusterTiles, hatClusters, hatPolygon, substituteCluster } from './geometry';

describe('hat monotile substitution geometry', () => {
	it('defines one reusable hat polygon', () => {
		expect(hatPolygon.length).toBeGreaterThan(10);
	});

	it('defines reusable H1, H2, H7, and H8 clusters', () => {
		expect(hatClusters.H1.tiles).toHaveLength(1);
		expect(hatClusters.H2.tiles).toHaveLength(2);
		expect(hatClusters.H7.tiles).toHaveLength(7);
		expect(hatClusters.H8.tiles).toHaveLength(8);
	});

	it('captures the deterministic substitution relationship', () => {
		expect(substituteCluster('H1').kind).toBe('H8');
		expect(substituteCluster('H2').kind).toBe('H7');
	});

	it('generates deterministic reflected and unreflected tiles', () => {
		const tiles = getHatClusterTiles('H1', 1);
		expect(tiles).toHaveLength(8);
		expect(tiles.some(tile => tile.reflected)).toBe(true);
		expect(tiles.some(tile => !tile.reflected)).toBe(true);
		expect(getHatClusterTiles('H1', 1)).toEqual(tiles);
	});
});
