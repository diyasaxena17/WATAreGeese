import { describe, expect, it } from 'vitest';

import { getBuildingOutlines, getCampusBuildingsGeoJson } from '../../campus-data/selectors';
import { CAMPUS_FEATURE_TYPES } from '../../campus-data/schema';
import { mapConfig } from '../../features/map/config/mapConfig';
import {
	CAMPUS_BUILDING_SOURCE_ID,
	CAMPUS_BUILDING_LABEL_SOURCE_ID,
	CAMPUS_PATH_SOURCE_ID,
	ROUTE_SOURCE_ID,
	campusBuildingExtrusionLayer,
	campusBuildingLabelLayer,
	campusBuildingLabelSource,
	campusBuildingSource,
	campusPathLineOpacity,
	campusPathPointOpacity,
	campusPathLayers,
	routeLayers,
	routeToGeoJson
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
				'fill-extrusion-opacity': 0.62
			}
		});
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
});
