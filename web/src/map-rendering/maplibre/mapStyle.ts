import type { StyleSpecification } from 'maplibre-gl';

export const BASEMAP_SOURCE_ID = 'basemap';
export const BASEMAP_LAYER_ID = 'basemap-muted-raster';

export function createSoftCampusMapStyle(tileUrl: string, attribution: string): StyleSpecification {
	return {
		version: 8,
		glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
		sources: {
			[BASEMAP_SOURCE_ID]: {
				type: 'raster',
				tiles: [tileUrl],
				tileSize: 256,
				attribution
			}
		},
		layers: [
			{
				id: 'background-warm-canvas',
				type: 'background',
				paint: {
					'background-color': '#f3f0e8'
				}
			},
			{
				id: BASEMAP_LAYER_ID,
				type: 'raster',
				source: BASEMAP_SOURCE_ID,
				paint: {
					'raster-opacity': 0.68,
					'raster-saturation': -0.72,
					'raster-contrast': -0.22,
					'raster-brightness-min': 0.16,
					'raster-brightness-max': 0.96,
					'raster-hue-rotate': 8
				}
			}
		]
	};
}
