import { describe, expect, it } from 'vitest';

import { getBuildingOutlines } from '../../campus-data/selectors';
import { CAMPUS_FEATURE_TYPES } from '../../campus-data/schema';
import { mapConfig } from '../../features/map/config/mapConfig';
import {
	CAMPUS_BUILDING_SOURCE_ID,
	campusBuildingExtrusionLayer,
	campusBuildingSource
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
});
