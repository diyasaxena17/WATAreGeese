import { describe, expect, it } from 'vitest';

import { getHatClusterTiles, hatClusters, hatPolygon, substituteCluster } from './geometry';

describe('hat monotile substitution geometry', () => {
	it('defines one reusable hat polygon', () => {
		expect(hatPolygon).toHaveLength(13);
	});

	it('defines the canonical Tile(1, sqrt(3)) hat edge lengths', () => {
		const sideLengths = hatPolygon.map((point, index) => {
			const next = hatPolygon[(index + 1) % hatPolygon.length];
			return Math.hypot(next.x - point.x, next.y - point.y);
		});

		expect(countApprox(sideLengths, 12)).toBe(6);
		expect(countApprox(sideLengths, 12 * Math.sqrt(3))).toBe(6);
		expect(countApprox(sideLengths, 24)).toBe(1);
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

function countApprox(values: number[], target: number) {
	return values.filter(value => Math.abs(value - target) < 0.0001).length;
}
