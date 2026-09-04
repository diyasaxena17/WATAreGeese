import { describe, expect, it } from 'vitest';

import { getBuildingOutlines, getCampusBuildingsGeoJson } from '../../campus-data/selectors';
import { CAMPUS_FEATURE_TYPES } from '../../campus-data/schema';
import { mapConfig } from '../../features/map/config/mapConfig';
import {
	CAMPUS_BUILDING_SOURCE_ID,
	CAMPUS_BUILDING_LABEL_SOURCE_ID,
	LOCATION_LABEL_SOURCE_ID,
	LOCATION_MARKER_SOURCE_ID,
	CAMPUS_PATH_SOURCE_ID,
	ROUTE_SOURCE_ID,
	SELECTED_BUILDING_SOURCE_ID,
	campusBuildingExtrusionLayer,
	campusBuildingExtrusionOpacity,
	campusBuildingLabelOpacity,
	campusBuildingLabelLayer,
	campusBuildingLabelSource,
	campusBuildingSource,
	locationMarkerLayers,
	campusPathLineOpacity,
	campusPathPointOpacity,
	campusPathLayers,
	mapLibreVisualTheme,
	routeLayers,
	routePointHighlightLayer,
	routeToGeoJson,
	selectedBuildingLayers,
	selectedLocationLabelLayer
} from './MapLibreMapLayers';

describe('MapLibre campus building layers', () => {
	it('uses existing building outline geometry as its source data', () => {
		const outlines = getBuildingOutlines();
		const source = campusBuildingSource(outlines);

		expect(source.type).toBe('geojson');
		expect(source.data).toEqual({
			type: 'FeatureCollection',
			features: outlines
		});
		expect(outlines.every(feature => feature.properties.type == CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE)).toBe(true);
	});

	it('renders outlines with restrained uniform fill extrusions', () => {
		expect(campusBuildingExtrusionLayer).toMatchObject({
			id: 'campus-building-extrusions',
			type: 'fill-extrusion',
			source: CAMPUS_BUILDING_SOURCE_ID,
			paint: {
				'fill-extrusion-base': mapConfig.maplibre.buildings.extrusionBaseHeight,
				'fill-extrusion-height': mapConfig.maplibre.buildings.defaultExtrusionHeight,
				'fill-extrusion-opacity': mapLibreVisualTheme.building.extrusionOpacity
			}
		});
	});

	it('fades building extrusions while directions are active without flattening the 3D context', () => {
		expect(campusBuildingExtrusionOpacity(false)).toBe(mapLibreVisualTheme.building.extrusionOpacity);
		expect(campusBuildingExtrusionOpacity(true)).toBeLessThan(campusBuildingExtrusionOpacity(false));
		expect(campusBuildingExtrusionOpacity(true)).toBeGreaterThan(0.35);
		expect(campusBuildingExtrusionLayer.paint?.['fill-extrusion-height'])
			.toBe(mapConfig.maplibre.buildings.defaultExtrusionHeight);
	});

	it('uses existing building point data for campus labels', () => {
		const buildings = getCampusBuildingsGeoJson();
		const source = campusBuildingLabelSource(buildings);

		expect(source).toEqual({
			type: 'geojson',
			data: buildings
		});
		expect(campusBuildingLabelLayer).toMatchObject({
			id: 'campus-building-labels',
			type: 'symbol',
			source: CAMPUS_BUILDING_LABEL_SOURCE_ID
		});
		expect(campusBuildingLabelLayer.layout?.['text-field']).toEqual(['get', 'buildingCode', ['get', 'building']]);
	});

	it('uses collision-aware zoom hierarchy for campus labels', () => {
		expect(campusBuildingLabelLayer.minzoom).toBe(15);
		expect(campusBuildingLabelLayer.filter).toEqual([
			'any',
			['>=', ['zoom'], 16.8],
			['>=', ['length', ['get', 'floors', ['get', 'building']]], 5]
		]);
		expect(campusBuildingLabelLayer.layout).toMatchObject({
			'text-allow-overlap': false,
			'text-ignore-placement': false,
			'text-optional': true,
			'text-padding': 8
		});
		expect(campusBuildingLabelLayer.layout?.['text-variable-anchor']).toContain('center');
		expect(campusBuildingLabelLayer.layout?.['symbol-sort-key']).toEqual([
			'-',
			12,
			['length', ['get', 'floors', ['get', 'building']]]
		]);
	});

	it('dims building labels when a route is active so route geometry stays dominant', () => {
		expect(campusBuildingLabelLayer.paint?.['text-opacity']).toEqual(campusBuildingLabelOpacity(false));
		expect(campusBuildingLabelOpacity(true)).toEqual([
			'interpolate',
			['linear'],
			['zoom'],
			15,
			0.3,
			16.8,
			0.5,
			17,
			0.58,
			18,
			0.68
		]);
	});

	it('keeps selected location labels collision-aware and separate from route data', () => {
		expect(selectedLocationLabelLayer).toMatchObject({
			id: 'selected-location-labels',
			type: 'symbol',
			source: LOCATION_LABEL_SOURCE_ID,
			layout: {
				'text-field': ['get', 'label'],
				'text-allow-overlap': false,
				'text-ignore-placement': false
			},
			paint: {
				'text-opacity': 0.92
			}
		});
		expect(selectedLocationLabelLayer.source).not.toBe(ROUTE_SOURCE_ID);
	});

	it('uses restrained selected-building fill and outline layers', () => {
		expect(selectedBuildingLayers.map(layer => layer.id)).toEqual([
			'selected-building-fill',
			'selected-building-outline'
		]);
		expect(selectedBuildingLayers.every(layer => layer.source == SELECTED_BUILDING_SOURCE_ID)).toBe(true);
		expect(selectedBuildingLayers[0].paint?.['fill-opacity']).toBeLessThan(0.2);
		expect(selectedBuildingLayers[1].type).toBe('line');
	});
});

describe('MapLibre location marker layers', () => {
	it('orders marker layers by accuracy, halo, core, and endpoint glyphs', () => {
		expect(locationMarkerLayers.map(layer => layer.id)).toEqual([
			'location-marker-accuracy',
			'location-marker-halo',
			'location-marker-core',
			'location-marker-glyphs'
		]);
		expect(locationMarkerLayers.every(layer => layer.source == LOCATION_MARKER_SOURCE_ID)).toBe(true);
	});

	it('distinguishes endpoints with glyphs instead of tiny color differences alone', () => {
		const glyphLayer = locationMarkerLayers.find(layer => layer.id == 'location-marker-glyphs');

		expect(glyphLayer?.type).toBe('symbol');
		expect(glyphLayer?.filter).toEqual(['!=', ['get', 'kind'], 'user']);
		expect(glyphLayer?.layout?.['text-field']).toEqual(['get', 'glyph']);
		expect(glyphLayer?.layout?.['text-allow-overlap']).toBe(true);
	});
});

describe('MapLibre campus path layers', () => {
	it('renders campus line paths with casing before semantic core lines', () => {
		expect(campusPathLayers.map(layer => layer.id)).toEqual([
			'campus-path-line-casing',
			'campus-path-lines',
			'campus-path-points'
		]);
		expect(campusPathLayers.every(layer => layer.source == CAMPUS_PATH_SOURCE_ID)).toBe(true);
	});

	it('keeps existing campus path semantics visible without inventing new ones', () => {
		const lineLayer = campusPathLayers.find(layer => layer.id == 'campus-path-lines');
		const paint = lineLayer?.paint ?? {};

		expect(paint['line-color']).toContain(CAMPUS_FEATURE_TYPES.BRIDGE);
		expect(paint['line-color']).toContain(CAMPUS_FEATURE_TYPES.HALLWAY);
		expect(paint['line-color']).toContain(CAMPUS_FEATURE_TYPES.TUNNEL);
		expect(paint['line-color']).toContain(CAMPUS_FEATURE_TYPES.WALKWAY);
		expect(paint['line-dasharray']).toContain(CAMPUS_FEATURE_TYPES.TUNNEL);
	});

	it('dims paths while preserving tunnel-specific lower contrast', () => {
		expect(campusPathLineOpacity(false)).toEqual([
			'match',
			['get', 'type'],
			CAMPUS_FEATURE_TYPES.TUNNEL,
			0.42,
			0.62
		]);
		expect(campusPathLineOpacity(true)).toEqual([
			'match',
			['get', 'type'],
			CAMPUS_FEATURE_TYPES.TUNNEL,
			0.2,
			0.25
		]);
		expect(campusPathPointOpacity(true)).toBe(0.25);
	});
});

describe('MapLibre route layers', () => {
	it('orders route layers from halo to core to highlighted segment to points', () => {
		expect(routeLayers.map(layer => layer.id)).toEqual([
			'active-route-line-halo',
			'active-route-line-core',
			'active-route-line-highlight',
			'active-route-points'
		]);
		expect(routeLayers.every(layer => layer.source == ROUTE_SOURCE_ID)).toBe(true);
		expect(routePointHighlightLayer).toMatchObject({
			id: 'active-route-point-highlight',
			type: 'circle',
			source: ROUTE_SOURCE_ID,
			filter: [
				'all',
				['==', ['geometry-type'], 'Point'],
				['==', ['get', 'isHighlighted'], true]
			],
			paint: {
				'circle-color': mapLibreVisualTheme.route.highlightColor
			}
		});
	});

	it('uses wide route strokes and halos so directions remain visible over 3D buildings', () => {
		const route = {
			graphLocations: [
				{ path: [[-80, 43]], travelMode: null },
				{ path: [[-80.1, 43.1], [-80.2, 43.2]], travelMode: CAMPUS_FEATURE_TYPES.WALKWAY },
				{ path: [[-80.2, 43.2], [-80.3, 43.3]], travelMode: CAMPUS_FEATURE_TYPES.BRIDGE }
			]
		};

		const geoJson = routeToGeoJson(route as never, 2);

		expect(geoJson.features[0].properties.width).toBeGreaterThanOrEqual(7);
		expect(geoJson.features[0].properties.haloWidth).toBeGreaterThanOrEqual(15);
		expect(geoJson.features[1].properties.highlightWidth).toBeGreaterThanOrEqual(10);
		expect(geoJson.features[1].properties.haloWidth).toBeGreaterThan(geoJson.features[0].properties.haloWidth);
	});

	it('maps highlighted route state without changing route coordinates', () => {
		const firstPath = [[-80.1, 43.1], [-80.2, 43.2]] as [number, number][];
		const highlightedPath = [[-80.2, 43.2], [-80.3, 43.3]] as [number, number][];
		const route = {
			graphLocations: [
				{ path: [[-80, 43]], travelMode: null },
				{ path: firstPath, travelMode: CAMPUS_FEATURE_TYPES.WALKWAY },
				{ path: highlightedPath, travelMode: CAMPUS_FEATURE_TYPES.BRIDGE }
			]
		};

		const geoJson = routeToGeoJson(route as never, 2);

		expect(geoJson.features).toHaveLength(2);
		expect(geoJson.features[0].geometry.coordinates).toBe(firstPath);
		expect(geoJson.features[0].properties.isHighlighted).toBe(false);
		expect(geoJson.features[1].geometry.coordinates).toBe(highlightedPath);
		expect(geoJson.features[1].properties.isHighlighted).toBe(true);
		expect(geoJson.features[1].properties.segmentIndex).toBe(2);
	});

	it('uses the same highlight colour for point-only selected steps as highlighted line steps', () => {
		const endpointPath = [[-80.1, 43.1]] as [number, number][];
		const route = {
			graphLocations: [
				{ path: [[-80, 43]], travelMode: null },
				{ path: endpointPath, travelMode: CAMPUS_FEATURE_TYPES.WALKWAY }
			]
		};

		const geoJson = routeToGeoJson(route as never, 1);

		expect(geoJson.features).toHaveLength(1);
		expect(geoJson.features[0].geometry.coordinates).toEqual(endpointPath[0]);
		expect(geoJson.features[0].properties.isHighlighted).toBe(true);
		expect(geoJson.features[0].properties.segmentIndex).toBe(1);
		expect(geoJson.features[0].properties.color).toBe(mapLibreVisualTheme.route.highlightColor);
	});
});
