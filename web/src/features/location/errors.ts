export type LocationErrorCode =
    | 'permission-denied'
    | 'position-unavailable'
    | 'timeout'
    | 'unsupported-browser'
    | 'unknown';

export class LocationError extends Error {
    readonly code: LocationErrorCode;

    constructor(code: LocationErrorCode, message: string) {
        super(message);
        this.name = 'LocationError';
        this.code = code;
    }
}

export function normalizeGeolocationError(error: GeolocationPositionError | null | undefined) {
    if(!error) {
        return new LocationError('unknown', 'Unable to determine your current location.');
    }

    if(error.code == error.PERMISSION_DENIED) {
        return new LocationError('permission-denied', 'Location permission was denied.');
    }

    if(error.code == error.POSITION_UNAVAILABLE) {
        return new LocationError('position-unavailable', 'Current location is unavailable.');
    }

    if(error.code == error.TIMEOUT) {
        return new LocationError('timeout', 'Current location request timed out.');
    }

    return new LocationError('unknown', error.message || 'Unable to determine your current location.');
}
