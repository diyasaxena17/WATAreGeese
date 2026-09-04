import { describe, expect, it } from 'vitest';

import { mapConfig } from '../../features/map/config/mapConfig';
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

	it('keeps the basemap detailed while still subordinate to campus overlays', () => {
		const style = createSoftCampusMapStyle('tiles', 'attribution');
		const basemapLayer = style.layers.find(layer => layer.id == BASEMAP_LAYER_ID);

		expect(basemapLayer).toMatchObject({
			type: 'raster',
			paint: {
				'raster-opacity': 0.92,
				'raster-saturation': -0.18,
				'raster-contrast': -0.08
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

	it('adds optional MapLibre raster-dem terrain with configured attribution', () => {
		const style = createSoftCampusMapStyle('tiles', 'attribution', mapConfig.maplibre.terrain);

		expect(style.sources[mapConfig.maplibre.terrain.sourceId]).toMatchObject({
			type: 'raster-dem',
			tiles: [mapConfig.maplibre.terrain.tileUrl],
			tileSize: 256,
			maxzoom: 15,
			encoding: 'terrarium',
			attribution: 'Elevation tiles &copy; Mapzen'
		});
		expect(style.terrain).toEqual({
			source: mapConfig.maplibre.terrain.sourceId,
			exaggeration: 1.15
		});
	});

	it('can produce the existing flat MapLibre style when terrain is disabled', () => {
		const style = createSoftCampusMapStyle('tiles', 'attribution', {
			...mapConfig.maplibre.terrain,
			enabled: false
		});

		expect(style.sources[mapConfig.maplibre.terrain.sourceId]).toBeUndefined();
		expect(style.terrain).toBeUndefined();
	});
});
