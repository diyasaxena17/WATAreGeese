export const CAMPUS_FEATURE_TYPES = {
    HALLWAY: 'hallway',
    DOOR: 'door',
    WALKWAY: 'walkway',
    BUILDING_OUTLINE: 'building-outline',
    TUNNEL: 'tunnel',
    STAIRS: 'stairs',
    BRIDGE: 'bridge',
    OPEN: 'open',
    BUILDING: 'building'
} as const;

export const ROUTING_FEATURE_TYPES = [
    CAMPUS_FEATURE_TYPES.HALLWAY,
    CAMPUS_FEATURE_TYPES.DOOR,
    CAMPUS_FEATURE_TYPES.WALKWAY,
    CAMPUS_FEATURE_TYPES.TUNNEL,
    CAMPUS_FEATURE_TYPES.STAIRS,
    CAMPUS_FEATURE_TYPES.BRIDGE,
    CAMPUS_FEATURE_TYPES.OPEN
] as const;

export type BuildingFloorProperties = {
    buildingCode: string;
    floor: string;
};

export type CampusFeatureType = typeof CAMPUS_FEATURE_TYPES[keyof typeof CAMPUS_FEATURE_TYPES];
export type RouteRelevantFeatureType = typeof ROUTING_FEATURE_TYPES[number];
export type PathFeatureType = Exclude<CampusFeatureType, 'building'>;

export type CampusGeoJsonFeature<TProperties, TGeometry> = {
    type: 'Feature';
    properties: TProperties;
    geometry: TGeometry;
};

export type CampusGeoJsonFeatureCollection<TFeature> = {
    type: 'FeatureCollection';
    features: TFeature[];
};

export type BuildingFeature = CampusGeoJsonFeature<{
    type: typeof CAMPUS_FEATURE_TYPES.BUILDING;
    building: {
        buildingCode: string;
        floors: string[];
    };
}, {
    type: 'Point';
    coordinates: [number, number];
}>;

export type BuildingOutlineFeature = CampusGeoJsonFeature<{
    type: typeof CAMPUS_FEATURE_TYPES.BUILDING_OUTLINE;
    default: BuildingFloorProperties;
}, {
    type: 'Polygon';
    coordinates: [number, number][][];
}>;

export type PathLineFeature = CampusGeoJsonFeature<{
    type:
        typeof CAMPUS_FEATURE_TYPES.HALLWAY |
        typeof CAMPUS_FEATURE_TYPES.BRIDGE |
        typeof CAMPUS_FEATURE_TYPES.TUNNEL |
        typeof CAMPUS_FEATURE_TYPES.WALKWAY;
    start: BuildingFloorProperties;
    end: BuildingFloorProperties;
}, {
    type: 'LineString';
    coordinates: [number, number][];
}>;

export type StairsFeature = CampusGeoJsonFeature<{
    type: typeof CAMPUS_FEATURE_TYPES.STAIRS;
    connections: (BuildingFloorProperties & {
        level: number;
    })[];
}, {
    type: 'Point';
    coordinates: [number, number];
}>;

export type DoorOrOpenFeature = CampusGeoJsonFeature<{
    type:
        typeof CAMPUS_FEATURE_TYPES.DOOR |
        typeof CAMPUS_FEATURE_TYPES.OPEN;
    start: BuildingFloorProperties;
    end: BuildingFloorProperties;
}, {
    type: 'Point';
    coordinates: [number, number];
}>;

export type RoutingFeature = PathLineFeature | StairsFeature | DoorOrOpenFeature;
export type PathFeature = RoutingFeature | BuildingOutlineFeature;

export type BuildingsGeoJson = CampusGeoJsonFeatureCollection<BuildingFeature>;
export type PathsGeoJson = CampusGeoJsonFeatureCollection<PathFeature>;
export type RoutingGeoJson = CampusGeoJsonFeatureCollection<RoutingFeature>;
