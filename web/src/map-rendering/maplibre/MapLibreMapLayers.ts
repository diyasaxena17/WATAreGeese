import type { GeoJSONSourceSpecification, LayerSpecification } from 'maplibre-gl';

import { CAMPUS_FEATURE_TYPES, CampusFeatureType, BuildingOutlineFeature, BuildingsGeoJson, PathsGeoJson } from '../../campus-data/schema';
import { mapConfig } from '../../features/map/config/mapConfig';
import { GraphLocation, Route } from '../../routing/types';

export const CAMPUS_BUILDING_SOURCE_ID = 'campus-building-outlines';
export const CAMPUS_BUILDING_LABEL_SOURCE_ID = 'campus-building-labels';
export const LOCATION_LABEL_SOURCE_ID = 'selected-location-labels';
export const LOCATION_MARKER_SOURCE_ID = 'selected-location-markers';
export const SELECTED_BUILDING_SOURCE_ID = 'selected-building-outline';
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

export const selectedBuildingLayers: LayerSpecification[] = [
	{
		id: 'selected-building-fill',
		type: 'fill',
		source: SELECTED_BUILDING_SOURCE_ID,
		paint: {
			'fill-color': '#f2a23a',
			'fill-opacity': 0.16
		}
	},
	{
		id: 'selected-building-outline',
		type: 'line',
		source: SELECTED_BUILDING_SOURCE_ID,
		layout: {
			'line-cap': 'round',
			'line-join': 'round'
		},
		paint: {
			'line-color': '#8b5a16',
			'line-opacity': 0.82,
			'line-width': [
				'interpolate',
				['linear'],
				['zoom'],
				15,
				1.4,
				18,
				2.6
			]
		}
	}
];

export function campusBuildingLabelSource(buildings: BuildingsGeoJson): GeoJSONSourceSpecification {
	return {
		type: 'geojson',
		data: buildings
	};
}

export const campusBuildingLabelLayer: LayerSpecification = {
	id: 'campus-building-labels',
	type: 'symbol',
	source: CAMPUS_BUILDING_LABEL_SOURCE_ID,
	minzoom: 15,
	filter: [
		'any',
		['>=', ['zoom'], 16.8],
		['>=', ['length', ['get', 'floors', ['get', 'building']]], 5]
	],
	layout: {
		'text-field': ['get', 'buildingCode', ['get', 'building']],
		'text-size': [
			'interpolate',
			['linear'],
			['zoom'],
			15,
			9,
			16.8,
			11,
			18,
			13.5
		],
		'text-font': ['Open Sans Semibold'],
		'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
		'text-radial-offset': 0.25,
		'text-allow-overlap': false,
		'text-ignore-placement': false,
		'text-padding': 8,
		'text-optional': true,
		'symbol-sort-key': ['-', 12, ['length', ['get', 'floors', ['get', 'building']]]]
	},
	paint: {
		'text-color': '#26332f',
		'text-halo-color': '#f7f3ea',
		'text-halo-width': 1.4,
		'text-halo-blur': 0.35,
		'text-opacity': [
			'interpolate',
			['linear'],
			['zoom'],
			15,
			0.48,
			16.8,
			0.72,
			17,
			0.82,
			18,
			0.9
		]
	}
};

export const selectedLocationLabelLayer: LayerSpecification = {
	id: 'selected-location-labels',
	type: 'symbol',
	source: LOCATION_LABEL_SOURCE_ID,
	minzoom: 15,
	layout: {
		'text-field': ['get', 'label'],
		'text-size': [
			'interpolate',
			['linear'],
			['zoom'],
			15,
			10,
			18,
			13
		],
		'text-font': ['Open Sans Semibold'],
		'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
		'text-radial-offset': 1,
		'text-allow-overlap': false,
		'text-ignore-placement': false,
		'text-padding': 10
	},
	paint: {
		'text-color': '#17211e',
		'text-halo-color': '#ffffff',
		'text-halo-width': 1.8,
		'text-halo-blur': 0.25,
		'text-opacity': 0.94
	}
};

export const locationMarkerLayers: LayerSpecification[] = [
	{
		id: 'location-marker-accuracy',
		type: 'circle',
		source: LOCATION_MARKER_SOURCE_ID,
		filter: [
			'all',
			['==', ['get', 'kind'], 'user'],
			['has', 'accuracyMeters']
		],
		paint: {
			'circle-color': '#2563eb',
			'circle-opacity': 0.12,
			'circle-radius': [
				'interpolate',
				['linear'],
				['get', 'accuracyMeters'],
				0,
				12,
				60,
				28
			],
			'circle-stroke-color': '#ffffff',
			'circle-stroke-opacity': 0.55,
			'circle-stroke-width': 1
		}
	},
	{
		id: 'location-marker-halo',
		type: 'circle',
		source: LOCATION_MARKER_SOURCE_ID,
		paint: {
			'circle-color': '#ffffff',
			'circle-radius': [
				'match',
				['get', 'kind'],
				'start',
				10,
				'end',
				11,
				8
			],
			'circle-opacity': [
				'match',
				['get', 'kind'],
				'user',
				0.86,
				0.96
			],
			'circle-stroke-color': [
				'match',
				['get', 'kind'],
				'start',
				'#2563eb',
				'end',
				'#111827',
				'#2563eb'
			],
			'circle-stroke-width': [
				'match',
				['get', 'kind'],
				'user',
				2,
				2.5
			]
		}
	},
	{
		id: 'location-marker-core',
		type: 'circle',
		source: LOCATION_MARKER_SOURCE_ID,
		paint: {
			'circle-color': [
				'match',
				['get', 'kind'],
				'start',
				'#ffffff',
				'end',
				'#111827',
				'#2563eb'
			],
			'circle-radius': [
				'match',
				['get', 'kind'],
				'start',
				5,
				'end',
				5.5,
				4.5
			],
			'circle-opacity': 0.98
		}
	},
	{
		id: 'location-marker-glyphs',
		type: 'symbol',
		source: LOCATION_MARKER_SOURCE_ID,
		filter: ['!=', ['get', 'kind'], 'user'],
		layout: {
			'text-field': ['get', 'glyph'],
			'text-font': ['Open Sans Semibold'],
			'text-size': 10,
			'text-allow-overlap': true,
			'text-ignore-placement': true
		},
		paint: {
			'text-color': [
				'match',
				['get', 'kind'],
				'start',
				'#1d4ed8',
				'#ffffff'
			],
			'text-halo-color': [
				'match',
				['get', 'kind'],
				'start',
				'#ffffff',
				'#111827'
			],
			'text-halo-width': 0.4
		}
	}
];

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
