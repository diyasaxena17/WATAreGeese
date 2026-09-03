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

export const mapLibreVisualTheme = {
	building: {
		extrusionColor: '#d6d0c4',
		extrusionOpacity: 0.56
	},
	selectedBuilding: {
		fillColor: '#f2a23a',
		fillOpacity: 0.12,
		outlineColor: '#8b5a16',
		outlineOpacity: 0.76
	},
	label: {
		textColor: '#26332f',
		haloColor: '#f7f3ea',
		endpointTextColor: '#17211e',
		endpointHaloColor: '#ffffff'
	},
	marker: {
		startColor: '#1d4ed8',
		destinationColor: '#111827',
		userColor: '#2563eb',
		haloColor: '#ffffff'
	},
	path: {
		casingColor: '#f7f3ea',
		bridgeColor: '#3f7f65',
		hallwayColor: '#7d91ad',
		tunnelColor: '#9a8a77',
		walkwayColor: '#bd8574',
		fallbackColor: '#798071',
		doorColor: '#4f9b70',
		openColor: '#5f7fa6',
		stairsColor: '#a98245'
	},
	route: {
		haloColor: '#ffffff',
		highlightColor: '#f2a23a',
		highlightPointColor: '#f59e0b',
		strokeColor: '#111827',
		bridgeColor: '#237052',
		hallwayColor: '#456eaa',
		tunnelColor: '#77634f',
		walkwayColor: '#ba5f4b',
		stairsColor: '#a66d20',
		fallbackColor: '#3f4a43'
	}
} as const;

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
		'fill-extrusion-color': mapLibreVisualTheme.building.extrusionColor,
		'fill-extrusion-base': mapConfig.maplibre.buildings.extrusionBaseHeight,
		'fill-extrusion-height': mapConfig.maplibre.buildings.defaultExtrusionHeight,
		'fill-extrusion-opacity': mapLibreVisualTheme.building.extrusionOpacity
	}
};

export const selectedBuildingLayers: LayerSpecification[] = [
	{
		id: 'selected-building-fill',
		type: 'fill',
		source: SELECTED_BUILDING_SOURCE_ID,
		paint: {
			'fill-color': mapLibreVisualTheme.selectedBuilding.fillColor,
			'fill-opacity': mapLibreVisualTheme.selectedBuilding.fillOpacity
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
			'line-color': mapLibreVisualTheme.selectedBuilding.outlineColor,
			'line-opacity': mapLibreVisualTheme.selectedBuilding.outlineOpacity,
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

export function campusBuildingLabelOpacity(dimmed: boolean) {
	return [
		'interpolate',
		['linear'],
		['zoom'],
		15,
		dimmed ? 0.3 : 0.42,
		16.8,
		dimmed ? 0.5 : 0.64,
		17,
		dimmed ? 0.58 : 0.72,
		18,
		dimmed ? 0.68 : 0.82
	];
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
		'text-color': mapLibreVisualTheme.label.textColor,
		'text-halo-color': mapLibreVisualTheme.label.haloColor,
		'text-halo-width': 1.4,
		'text-halo-blur': 0.35,
		'text-opacity': campusBuildingLabelOpacity(false)
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
		'text-color': mapLibreVisualTheme.label.endpointTextColor,
		'text-halo-color': mapLibreVisualTheme.label.endpointHaloColor,
		'text-halo-width': 1.8,
		'text-halo-blur': 0.25,
		'text-opacity': 0.92
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
			'circle-color': mapLibreVisualTheme.marker.userColor,
			'circle-opacity': 0.1,
			'circle-radius': [
				'interpolate',
				['linear'],
				['get', 'accuracyMeters'],
				0,
				12,
				60,
				28
			],
			'circle-stroke-color': mapLibreVisualTheme.marker.haloColor,
			'circle-stroke-opacity': 0.55,
			'circle-stroke-width': 1
		}
	},
	{
		id: 'location-marker-halo',
		type: 'circle',
		source: LOCATION_MARKER_SOURCE_ID,
		paint: {
			'circle-color': mapLibreVisualTheme.marker.haloColor,
			'circle-radius': [
				'match',
				['get', 'kind'],
				'start',
				10,
				'end',
				10,
				7.5
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
				mapLibreVisualTheme.marker.startColor,
				'end',
				mapLibreVisualTheme.marker.destinationColor,
				mapLibreVisualTheme.marker.userColor
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
				mapLibreVisualTheme.marker.haloColor,
				'end',
				mapLibreVisualTheme.marker.destinationColor,
				mapLibreVisualTheme.marker.userColor
			],
			'circle-radius': [
				'match',
				['get', 'kind'],
				'start',
				5.2,
				'end',
				5.2,
				4.2
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
				mapLibreVisualTheme.marker.startColor,
				mapLibreVisualTheme.marker.haloColor
			],
			'text-halo-color': [
				'match',
				['get', 'kind'],
				'start',
				mapLibreVisualTheme.marker.haloColor,
				mapLibreVisualTheme.marker.destinationColor
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
			'line-color': mapLibreVisualTheme.path.casingColor,
			'line-opacity': 0.62,
			'line-width': [
				'match',
				['get', 'type'],
				CAMPUS_FEATURE_TYPES.BRIDGE,
				6.4,
				CAMPUS_FEATURE_TYPES.TUNNEL,
				4.6,
				5.2
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
				mapLibreVisualTheme.path.bridgeColor,
				CAMPUS_FEATURE_TYPES.HALLWAY,
				mapLibreVisualTheme.path.hallwayColor,
				CAMPUS_FEATURE_TYPES.TUNNEL,
				mapLibreVisualTheme.path.tunnelColor,
				CAMPUS_FEATURE_TYPES.WALKWAY,
				mapLibreVisualTheme.path.walkwayColor,
				mapLibreVisualTheme.path.fallbackColor
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
				4,
				CAMPUS_FEATURE_TYPES.TUNNEL,
				2.6,
				3.2
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
				mapLibreVisualTheme.path.doorColor,
				CAMPUS_FEATURE_TYPES.OPEN,
				mapLibreVisualTheme.path.openColor,
				CAMPUS_FEATURE_TYPES.STAIRS,
				mapLibreVisualTheme.path.stairsColor,
				mapLibreVisualTheme.path.fallbackColor
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
			'line-color': mapLibreVisualTheme.route.haloColor,
			'line-width': ['get', 'haloWidth'],
			'line-opacity': 0.9
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
			'line-color': mapLibreVisualTheme.route.highlightColor,
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
			'circle-stroke-color': mapLibreVisualTheme.route.strokeColor,
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
						color: isHighlighted ? mapLibreVisualTheme.route.highlightPointColor : routeColor(graphLocation),
						radius: isHighlighted ? 7.2 : 5.2,
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
					color: isHighlighted ? mapLibreVisualTheme.route.highlightPointColor : routeColor(graphLocation),
					width: 6.2,
					haloWidth: isHighlighted ? 13.5 : 11.5,
					highlightWidth: 8.6,
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
	if(type == CAMPUS_FEATURE_TYPES.BRIDGE) return mapLibreVisualTheme.route.bridgeColor;
	if(type == CAMPUS_FEATURE_TYPES.HALLWAY) return mapLibreVisualTheme.route.hallwayColor;
	if(type == CAMPUS_FEATURE_TYPES.TUNNEL) return mapLibreVisualTheme.route.tunnelColor;
	if(type == CAMPUS_FEATURE_TYPES.WALKWAY) return mapLibreVisualTheme.route.walkwayColor;
	if(type == CAMPUS_FEATURE_TYPES.DOOR) return mapLibreVisualTheme.route.bridgeColor;
	if(type == CAMPUS_FEATURE_TYPES.OPEN) return mapLibreVisualTheme.route.hallwayColor;
	if(type == CAMPUS_FEATURE_TYPES.STAIRS) return mapLibreVisualTheme.route.stairsColor;
	return mapLibreVisualTheme.route.fallbackColor;
}
