import { describe, expect, it } from 'vitest';

import rawBuildings from './buildings.json';
import rawPaths from './paths.json';
import { CAMPUS_FEATURE_TYPES, ROUTING_FEATURE_TYPES } from './schema';
import {
    getBridges,
    getBuildingOutlines,
    getBuildings,
    getCampusBuildingsGeoJson,
    getCampusPathsGeoJson,
    getFeaturesByType,
    getPathFeatures,
    getRoutingFeatures,
    getRoutingGeoJson,
    getStairs,
    getTunnels
} from './selectors';

const expectedPathCounts = {
    [CAMPUS_FEATURE_TYPES.HALLWAY]: 96,
    [CAMPUS_FEATURE_TYPES.DOOR]: 51,
    [CAMPUS_FEATURE_TYPES.WALKWAY]: 25,
    [CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE]: 40,
    [CAMPUS_FEATURE_TYPES.TUNNEL]: 10,
    [CAMPUS_FEATURE_TYPES.STAIRS]: 53,
    [CAMPUS_FEATURE_TYPES.BRIDGE]: 12,
    [CAMPUS_FEATURE_TYPES.OPEN]: 2
};

function countPathFeaturesByType() {
    return getPathFeatures().reduce((counts, feature) => {
        counts[feature.properties.type] = (counts[feature.properties.type] ?? 0) + 1;
        return counts;
    }, {} as Record<string, number>);
}

describe('campus-data selectors', () => {
    it('preserves the expected raw building and path feature counts', () => {
        expect(getBuildings()).toHaveLength(58);
        expect(getPathFeatures()).toHaveLength(289);
        expect(countPathFeaturesByType()).toEqual(expectedPathCounts);
    });

    it('returns the raw campus GeoJSON through explicit accessors', () => {
        expect(getCampusBuildingsGeoJson()).toBe(rawBuildings);
        expect(getCampusPathsGeoJson()).toBe(rawPaths);
    });

    it('excludes building-outline features from routing features', () => {
        expect(getRoutingFeatures()).toHaveLength(249);
        expect(getRoutingGeoJson().features).toHaveLength(249);
        expect(getRoutingFeatures().some(feature =>
            feature.properties.type == CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE
        )).toBe(false);
    });

    it('keeps route-relevant feature types centralized', () => {
        expect(ROUTING_FEATURE_TYPES).toEqual([
            CAMPUS_FEATURE_TYPES.HALLWAY,
            CAMPUS_FEATURE_TYPES.DOOR,
            CAMPUS_FEATURE_TYPES.WALKWAY,
            CAMPUS_FEATURE_TYPES.TUNNEL,
            CAMPUS_FEATURE_TYPES.STAIRS,
            CAMPUS_FEATURE_TYPES.BRIDGE,
            CAMPUS_FEATURE_TYPES.OPEN
        ]);
    });

    it('filters features by requested type', () => {
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.BUILDING)).toHaveLength(58);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE)).toHaveLength(40);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.HALLWAY)).toHaveLength(96);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.DOOR)).toHaveLength(51);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.WALKWAY)).toHaveLength(25);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.TUNNEL)).toHaveLength(10);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.STAIRS)).toHaveLength(53);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.BRIDGE)).toHaveLength(12);
        expect(getFeaturesByType(CAMPUS_FEATURE_TYPES.OPEN)).toHaveLength(2);
    });

    it('provides convenience selectors for common route and map features', () => {
        expect(getBuildingOutlines()).toHaveLength(40);
        expect(getBridges()).toHaveLength(12);
        expect(getTunnels()).toHaveLength(10);
        expect(getStairs()).toHaveLength(53);
        expect(getBridges().every(feature => feature.properties.type == CAMPUS_FEATURE_TYPES.BRIDGE)).toBe(true);
        expect(getTunnels().every(feature => feature.properties.type == CAMPUS_FEATURE_TYPES.TUNNEL)).toBe(true);
        expect(getStairs().every(feature => feature.properties.type == CAMPUS_FEATURE_TYPES.STAIRS)).toBe(true);
    });

    it('does not mutate imported raw data while selecting', () => {
        const beforeBuildings = JSON.stringify(rawBuildings);
        const beforePaths = JSON.stringify(rawPaths);

        getBuildings();
        getPathFeatures();
        getRoutingFeatures();
        getRoutingGeoJson();
        getBuildingOutlines();
        getFeaturesByType(CAMPUS_FEATURE_TYPES.BRIDGE);
        getBridges();
        getTunnels();
        getStairs();

        expect(JSON.stringify(rawBuildings)).toBe(beforeBuildings);
        expect(JSON.stringify(rawPaths)).toBe(beforePaths);
    });

    it('returns new arrays so callers cannot resize the imported feature arrays', () => {
        const buildings = getBuildings();
        const paths = getPathFeatures();
        const routingFeatures = getRoutingFeatures();

        buildings.pop();
        paths.pop();
        routingFeatures.pop();

        expect(getBuildings()).toHaveLength(58);
        expect(getPathFeatures()).toHaveLength(289);
        expect(getRoutingFeatures()).toHaveLength(249);
    });
});
