import { LocationError, normalizeGeolocationError } from './errors';
import { LocationRequestOptions, LocationService, UserPosition } from './types';

const DEFAULT_OPTIONS: Required<LocationRequestOptions> = {
    enableHighAccuracy: true,
    timeoutMs: 10000,
    maximumAgeMs: 30000
};

export class BrowserGeolocationService implements LocationService {
    private readonly geolocation: Geolocation | null;

    constructor(geolocation = globalThis.navigator?.geolocation ?? null) {
        this.geolocation = geolocation;
    }

    getCurrentPosition(options: LocationRequestOptions = {}) {
        if(!this.geolocation) {
            return Promise.reject(new LocationError('unsupported-browser', 'This browser does not support current location.'));
        }

        const requestOptions = toBrowserPositionOptions(options);

        return new Promise<UserPosition>((resolve, reject) => {
            this.geolocation?.getCurrentPosition(
                position => resolve(toUserPosition(position)),
                error => reject(normalizeGeolocationError(error)),
                requestOptions
            );
        });
    }
}

export function toUserPosition(position: GeolocationPosition): UserPosition {
    return {
        coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
        accuracyMeters: position.coords.accuracy,
        timestamp: position.timestamp
    };
}

function toBrowserPositionOptions(options: LocationRequestOptions): PositionOptions {
    return {
        enableHighAccuracy: options.enableHighAccuracy ?? DEFAULT_OPTIONS.enableHighAccuracy,
        timeout: options.timeoutMs ?? DEFAULT_OPTIONS.timeoutMs,
        maximumAge: options.maximumAgeMs ?? DEFAULT_OPTIONS.maximumAgeMs
    };
}
