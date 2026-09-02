import { describe, expect, it } from 'vitest';

import { BASEMAP_LAYER_ID, BASEMAP_SOURCE_ID, createSoftCampusMapStyle } from './mapStyle';

describe('createSoftCampusMapStyle', () => {
	it('uses the configured free raster tile source with attribution', () => {
		const style = createSoftCampusMapStyle(
			'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'OpenStreetMap contributors'
		);

		expect(style.sources[BASEMAP_SOURCE_ID]).toMatchObject({
			type: 'raster',
			tiles: ['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'],
			tileSize: 256,
			attribution: 'OpenStreetMap contributors'
		});
	});

	it('keeps the basemap visually subordinate to campus overlays', () => {
		const style = createSoftCampusMapStyle('tiles', 'attribution');
		const basemapLayer = style.layers.find(layer => layer.id == BASEMAP_LAYER_ID);

		expect(basemapLayer).toMatchObject({
			type: 'raster',
			paint: {
				'raster-opacity': 0.68,
				'raster-saturation': -0.72,
				'raster-contrast': -0.22
			}
		});
	});

	it('adds a warm neutral canvas behind unloaded raster tiles', () => {
		const style = createSoftCampusMapStyle('tiles', 'attribution');

		expect(style.layers[0]).toMatchObject({
			type: 'background',
			paint: {
				'background-color': '#f3f0e8'
			}
		});
	});
});
