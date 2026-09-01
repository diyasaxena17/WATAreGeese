import { GeoJSONSourceSpecification, LayerSpecification } from 'maplibre-gl';

import { CAMPUS_FEATURE_TYPES, CampusFeatureType, BuildingOutlineFeature, PathsGeoJson } from '../../campus-data/schema';
import { mapConfig } from '../../features/map/config/mapConfig';
import { GraphLocation, Route } from '../../routing/types';

export const CAMPUS_BUILDING_SOURCE_ID = 'campus-building-outlines';
export const CAMPUS_PATH_SOURCE_ID = 'campus-paths';
export const ROUTE_SOURCE_ID = 'active-route';

export function campusBuildingSource(outlines: BuildingOutlineFeature[]): GeoJSONSourceSpecification {
	return {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: outlines
		}
	};
}

export const campusBuildingExtrusionLayer: LayerSpecification = {
	id: 'campus-building-extrusions',
	type: 'fill-extrusion',
	source: CAMPUS_BUILDING_SOURCE_ID,
	paint: {
		'fill-extrusion-color': '#d8d0c3',
		'fill-extrusion-base': mapConfig.maplibre.buildings.extrusionBaseHeight,
		'fill-extrusion-height': mapConfig.maplibre.buildings.defaultExtrusionHeight,
		'fill-extrusion-opacity': 0.62
	}
};

export function campusPathSource(paths: PathsGeoJson): GeoJSONSourceSpecification {
	return {
		type: 'geojson',
		data: paths
	};
}

export function campusPathLineOpacity(dimmed: boolean) {
	return [
		'match',
		['get', 'type'],
		CAMPUS_FEATURE_TYPES.TUNNEL,
		dimmed ? 0.2 : 0.42,
		dimmed ? 0.25 : 0.62
	];
}

export function campusPathPointOpacity(dimmed: boolean) {
	return dimmed ? 0.25 : 0.68;
}

export const campusPathLayers: LayerSpecification[] = [
	{
		id: 'campus-path-line-casing',
		type: 'line',
		source: CAMPUS_PATH_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'LineString'],
		layout: {
			'line-cap': 'round',
			'line-join': 'round'
		},
		paint: {
			'line-color': '#f7f3ea',
			'line-opacity': 0.68,
			'line-width': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.BRIDGE,
				7,
				CAMPUS_FEATURE_TYPES.TUNNEL,
				5,
				6
			]
		}
	},
	{
		id: 'campus-path-lines',
		type: 'line',
		source: CAMPUS_PATH_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'LineString'],
		layout: {
			'line-cap': 'round',
			'line-join': 'round'
		},
		paint: {
			'line-color': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.BRIDGE,
				'#3f7f65',
				CAMPUS_FEATURE_TYPES.HALLWAY,
				'#7d91ad',
				CAMPUS_FEATURE_TYPES.TUNNEL,
				'#9a8a77',
				CAMPUS_FEATURE_TYPES.WALKWAY,
				'#bd8574',
				'#798071'
			],
			'line-dasharray': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.TUNNEL,
				['literal', [1.2, 1.1]],
				['literal', [1]]
			],
			'line-opacity': campusPathLineOpacity(false),
			'line-width': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.BRIDGE,
				4.4,
				CAMPUS_FEATURE_TYPES.TUNNEL,
				3,
				3.6
			]
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
				'#4f9b70',
				CAMPUS_FEATURE_TYPES.OPEN,
				'#5f7fa6',
				CAMPUS_FEATURE_TYPES.STAIRS,
				'#a98245',
				'#798071'
			],
			'circle-opacity': campusPathPointOpacity(false),
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
		id: 'active-route-line-halo',
		type: 'line',
		source: ROUTE_SOURCE_ID,
		filter: ['==', ['geometry-type'], 'LineString'],
		layout: {
			'line-cap': 'round',
			'line-join': 'round'
		},
		paint: {
			'line-color': '#ffffff',
			'line-width': ['get', 'haloWidth'],
			'line-opacity': 0.86
		}
	},
	{
		id: 'active-route-line-core',
		type: 'line',
		source: ROUTE_SOURCE_ID,
		filter: [
			'all',
			['==', ['geometry-type'], 'LineString'],
			['!=', ['get', 'isHighlighted'], true]
		],
		layout: {
			'line-cap': 'round',
			'line-join': 'round'
		},
		paint: {
			'line-color': ['get', 'color'],
			'line-width': ['get', 'width'],
			'line-opacity': 0.98
		}
	},
	{
		id: 'active-route-line-highlight',
		type: 'line',
		source: ROUTE_SOURCE_ID,
		filter: [
			'all',
			['==', ['geometry-type'], 'LineString'],
			['==', ['get', 'isHighlighted'], true]
		],
		layout: {
			'line-cap': 'round',
			'line-join': 'round'
		},
		paint: {
			'line-color': '#f2a23a',
			'line-width': ['get', 'highlightWidth'],
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
						radius: isHighlighted ? 7 : 5,
						isHighlighted
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
					width: 6,
					haloWidth: isHighlighted ? 13 : 11,
					highlightWidth: 8,
					isHighlighted,
					segmentIndex: index
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
	if(type == CAMPUS_FEATURE_TYPES.BRIDGE) return '#237052';
	if(type == CAMPUS_FEATURE_TYPES.HALLWAY) return '#456eaa';
	if(type == CAMPUS_FEATURE_TYPES.TUNNEL) return '#77634f';
	if(type == CAMPUS_FEATURE_TYPES.WALKWAY) return '#ba5f4b';
	if(type == CAMPUS_FEATURE_TYPES.DOOR) return '#237052';
	if(type == CAMPUS_FEATURE_TYPES.OPEN) return '#456eaa';
	if(type == CAMPUS_FEATURE_TYPES.STAIRS) return '#a66d20';
	return '#3f4a43';
}
