import { GeoJSONSourceSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl';

import { CAMPUS_FEATURE_TYPES, CampusFeatureType, PathsGeoJson } from '../../campus-data/schema';
import { GraphLocation, Route } from '../../routing/types';

export const CAMPUS_PATH_SOURCE_ID = 'campus-paths';
export const ROUTE_SOURCE_ID = 'active-route';

export function createCampusMapStyle(tileUrl: string, attribution: string): StyleSpecification {
	return {
		version: 8,
		sources: {
			basemap: {
				type: 'raster',
				tiles: [tileUrl],
				tileSize: 256,
				attribution
			}
		},
		layers: [
			{
				id: 'basemap',
				type: 'raster',
				source: 'basemap',
				paint: {
					'raster-opacity': 0.82,
					'raster-saturation': -0.45,
					'raster-contrast': -0.1
				}
			}
		]
	};
}

export function campusPathSource(paths: PathsGeoJson): GeoJSONSourceSpecification {
	return {
		type: 'geojson',
		data: paths
	};
}

export const campusPathLayers: LayerSpecification[] = [
	{
		id: 'campus-path-lines',
		type: 'line',
		source: CAMPUS_PATH_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'LineString'],
		paint: {
			'line-color': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.BRIDGE,
				'green',
				CAMPUS_FEATURE_TYPES.HALLWAY,
				'#668cff',
				CAMPUS_FEATURE_TYPES.TUNNEL,
				'#86592d',
				CAMPUS_FEATURE_TYPES.WALKWAY,
				'#ff6666',
				'black'
			],
			'line-opacity': 0.6,
			'line-width': 4
		}
	},
	{
		id: 'campus-path-points',
		type: 'circle',
		source: CAMPUS_PATH_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'Point'],
		paint: {
			'circle-color': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.DOOR,
				'#0f9d58',
				CAMPUS_FEATURE_TYPES.OPEN,
				'#2563eb',
				CAMPUS_FEATURE_TYPES.STAIRS,
				'#f59e0b',
				'black'
			],
			'circle-opacity': 0.6,
			'circle-radius': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.STAIRS,
				3.5,
				2.5
			]
		}
	}
];

export const routeLayers: LayerSpecification[] = [
	{
		id: 'active-route-line',
		type: 'line',
		source: ROUTE_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'LineString'],
		paint: {
			'line-color': ['get', 'color'],
			'line-width': ['get', 'width'],
			'line-opacity': 1
		}
	},
	{
		id: 'active-route-points',
		type: 'circle',
		source: ROUTE_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'Point'],
		paint: {
			'circle-color': ['get', 'color'],
			'circle-radius': ['get', 'radius'],
			'circle-opacity': 0.95,
			'circle-stroke-color': '#111827',
			'circle-stroke-width': 2
		}
	}
];

export function routeToGeoJson(route: Route | null, highlightedDirection: number | null) {
	return {
		type: 'FeatureCollection' as const,
		features: route?.graphLocations.flatMap((graphLocation, index) => {
			if(index == 0) return [];

			const isHighlighted = highlightedDirection == index;
			const coordinates = graphLocation.path;

			if(coordinates.length == 1) {
				return [{
					type: 'Feature' as const,
					properties: {
						color: isHighlighted ? '#f59e0b' : routeColor(graphLocation),
						radius: isHighlighted ? 7 : 5
					},
					geometry: {
						type: 'Point' as const,
						coordinates: coordinates[0]
					}
				}];
			}

			return [{
				type: 'Feature' as const,
				properties: {
					color: isHighlighted ? '#f59e0b' : routeColor(graphLocation),
					width: isHighlighted ? 8 : 6
				},
				geometry: {
					type: 'LineString' as const,
					coordinates
				}
			}];
		}) ?? []
	};
}

function routeColor(graphLocation: GraphLocation) {
	return pathColor(graphLocation.travelMode as CampusFeatureType);
}

function pathColor(type: CampusFeatureType) {
	if(type == CAMPUS_FEATURE_TYPES.BRIDGE) return 'green';
	if(type == CAMPUS_FEATURE_TYPES.HALLWAY) return '#668cff';
	if(type == CAMPUS_FEATURE_TYPES.TUNNEL) return '#86592d';
	if(type == CAMPUS_FEATURE_TYPES.WALKWAY) return '#ff6666';
	if(type == CAMPUS_FEATURE_TYPES.DOOR) return '#0f9d58';
	if(type == CAMPUS_FEATURE_TYPES.OPEN) return '#2563eb';
	if(type == CAMPUS_FEATURE_TYPES.STAIRS) return '#f59e0b';
	return 'black';
}
