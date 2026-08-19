export type GeoPoint = {
    latitude: number;
    longitude: number;
};

export type UserPosition = {
    coordinates: GeoPoint;
    accuracyMeters?: number;
    timestamp?: number;
};

export type LocationRequestOptions = {
    enableHighAccuracy?: boolean;
    timeoutMs?: number;
    maximumAgeMs?: number;
};

export type LocationService = {
    getCurrentPosition: (options?: LocationRequestOptions) => Promise<UserPosition>;
};
