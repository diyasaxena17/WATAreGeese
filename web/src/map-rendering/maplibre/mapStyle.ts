import type { StyleSpecification } from 'maplibre-gl';

export const BASEMAP_SOURCE_ID = 'basemap';
export const BASEMAP_LAYER_ID = 'basemap-muted-raster';

type TerrainStyleConfig = {
	enabled: boolean;
	sourceId: string;
	tileUrl: string;
	attribution: string;
	tileSize: number;
	maxzoom: number;
	encoding: 'terrarium' | 'mapbox';
	exaggeration: number;
};

export function createSoftCampusMapStyle(
	tileUrl: string,
	attribution: string,
	terrain?: TerrainStyleConfig
): StyleSpecification {
	return {
		version: 8,
		glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
		sources: {
			[BASEMAP_SOURCE_ID]: {
				type: 'raster',
				tiles: [tileUrl],
				tileSize: 256,
				attribution
			},
			...(terrain?.enabled ? {
				[terrain.sourceId]: {
					type: 'raster-dem' as const,
					tiles: [terrain.tileUrl],
					tileSize: terrain.tileSize,
					maxzoom: terrain.maxzoom,
					encoding: terrain.encoding,
					attribution: terrain.attribution
				}
			} : {})
		},
		...(terrain?.enabled ? {
			terrain: {
				source: terrain.sourceId,
				exaggeration: terrain.exaggeration
			}
		} : {}),
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
					'raster-opacity': 0.92,
					'raster-saturation': -0.18,
					'raster-contrast': -0.08,
					'raster-brightness-min': 0.05,
					'raster-brightness-max': 1,
					'raster-hue-rotate': 0
				}
			}
		]
	};
}
