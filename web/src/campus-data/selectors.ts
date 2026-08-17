import buildingsGeoJson from './buildings.json';
import pathsGeoJson from './paths.json';
import {
    CAMPUS_FEATURE_TYPES,
    ROUTING_FEATURE_TYPES,
    BuildingFeature,
    BuildingOutlineFeature,
    BuildingsGeoJson,
    CampusFeatureType,
    PathFeature,
    PathLineFeature,
    PathsGeoJson,
    RouteRelevantFeatureType,
    RoutingFeature,
    RoutingGeoJson,
    StairsFeature
} from './schema';

const buildings = buildingsGeoJson as BuildingsGeoJson;
const paths = pathsGeoJson as PathsGeoJson;
const routingFeatureTypes = new Set<CampusFeatureType>(ROUTING_FEATURE_TYPES);

export function getBuildings(): BuildingFeature[] {
    return buildings.features.slice();
}

export function getPathFeatures(): PathFeature[] {
    return paths.features.slice();
}

export function getRoutingFeatures(): RoutingFeature[] {
    return paths.features.filter((feature): feature is RoutingFeature =>
        routingFeatureTypes.has(feature.properties.type)
    );
}

export function getRoutingGeoJson(): RoutingGeoJson {
    return {
        ...paths,
        features: getRoutingFeatures()
    };
}

export function getBuildingOutlines(): BuildingOutlineFeature[] {
    return getFeaturesByType(CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE) as BuildingOutlineFeature[];
}

export function getFeaturesByType(type: typeof CAMPUS_FEATURE_TYPES.BUILDING): BuildingFeature[];
export function getFeaturesByType(type: typeof CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE): BuildingOutlineFeature[];
export function getFeaturesByType(type: RouteRelevantFeatureType): RoutingFeature[];
export function getFeaturesByType(type: CampusFeatureType): (BuildingFeature | PathFeature)[] {
    if(type == CAMPUS_FEATURE_TYPES.BUILDING) {
        return buildings.features.filter(feature => feature.properties.type == type);
    }

    return paths.features.filter(feature => feature.properties.type == type);
}

export function getBridges(): PathLineFeature[] {
    return getFeaturesByType(CAMPUS_FEATURE_TYPES.BRIDGE) as PathLineFeature[];
}

export function getTunnels(): PathLineFeature[] {
    return getFeaturesByType(CAMPUS_FEATURE_TYPES.TUNNEL) as PathLineFeature[];
}

export function getStairs(): StairsFeature[] {
    return getFeaturesByType(CAMPUS_FEATURE_TYPES.STAIRS) as StairsFeature[];
}

export function getCampusBuildingsGeoJson(): BuildingsGeoJson {
    return buildings;
}

export function getCampusPathsGeoJson(): PathsGeoJson {
    return paths;
}
