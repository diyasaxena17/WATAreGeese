import { describe, expect, it } from 'vitest';

import { mapConfig } from './mapConfig';

describe('mapConfig', () => {
	it('centralizes the development tile source and attribution', () => {
		expect(mapConfig.tileUrl).toContain('openstreetmap.org');
		expect(mapConfig.attribution).toContain('OpenStreetMap');
		expect(mapConfig.center).toEqual([43.4718, -80.543]);
		expect(mapConfig.defaultZoom).toBe(16);
	});
});
