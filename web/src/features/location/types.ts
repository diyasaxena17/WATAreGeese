import type { LocationError } from './errors';

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
    watchPosition?: (
        onPosition: (position: UserPosition) => void,
        onError: (error: LocationError) => void,
        options?: LocationRequestOptions
    ) => () => void;
};

export type UserLocationStatus =
    | 'idle'
    | 'requesting'
    | 'available'
    | 'denied'
    | 'unavailable'
    | 'error';
