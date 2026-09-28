import { describe, expect, it, vi } from 'vitest';

import { LocationError, normalizeGeolocationError } from './errors';
import { BrowserGeolocationService, toUserPosition } from './geolocationService';

function makePosition(overrides: Partial<GeolocationCoordinates> = {}): GeolocationPosition {
    return {
        coords: {
            latitude: overrides.latitude ?? 43.4723,
            longitude: overrides.longitude ?? -80.5449,
            accuracy: overrides.accuracy ?? 12,
            altitude: overrides.altitude ?? null,
            altitudeAccuracy: overrides.altitudeAccuracy ?? null,
            heading: overrides.heading ?? null,
            speed: overrides.speed ?? null,
            toJSON: () => ({})
        },
        timestamp: 1720000000000,
        toJSON: () => ({})
    };
}

function makeError(code: number, message = 'browser error'): GeolocationPositionError {
    return {
        code,
        message,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
    };
}

function makeGeolocation({
    position,
    error,
    watchId = 7
}: {
    position?: GeolocationPosition;
    error?: GeolocationPositionError;
    watchId?: number;
} = {}): Geolocation {
    return {
        getCurrentPosition: vi.fn((success: PositionCallback, failure?: PositionErrorCallback) => {
            if(error) failure?.(error);
            else success(position ?? makePosition());
        }),
        watchPosition: vi.fn((success: PositionCallback, failure?: PositionErrorCallback) => {
            if(error) failure?.(error);
            else success(position ?? makePosition());
            return watchId;
        }),
        clearWatch: vi.fn()
    };
}

describe('BrowserGeolocationService', () => {
    it('converts a browser position into the location domain model', async () => {
        const geolocation = makeGeolocation({
            position: makePosition({
                latitude: 43.4718,
                longitude: -80.5434,
                accuracy: 8
            })
        });

        const result = await new BrowserGeolocationService(geolocation).getCurrentPosition();

        expect(result).toEqual({
            coordinates: {
                latitude: 43.4718,
                longitude: -80.5434
            },
            accuracyMeters: 8,
            timestamp: 1720000000000
        });
    });

    it('preserves coordinates without rounding or projection', () => {
        const result = toUserPosition(makePosition({
            latitude: 43.1234567,
            longitude: -80.7654321
        }));

        expect(result.coordinates.latitude).toBe(43.1234567);
        expect(result.coordinates.longitude).toBe(-80.7654321);
    });

    it('passes campus-friendly browser request options', async () => {
        const geolocation = makeGeolocation();

        await new BrowserGeolocationService(geolocation).getCurrentPosition();

        expect(geolocation.getCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    });

    it('allows request options to be overridden for callers', async () => {
        const geolocation = makeGeolocation();

        await new BrowserGeolocationService(geolocation).getCurrentPosition({
            enableHighAccuracy: false,
            timeoutMs: 2500,
            maximumAgeMs: 0
        });

        expect(geolocation.getCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            {
                enableHighAccuracy: false,
                timeout: 2500,
                maximumAge: 0
            }
        );
    });

    it('watches movement with the same normalized position model and stops by watch id', () => {
        const geolocation = makeGeolocation({
            position: makePosition({
                latitude: 43.4731,
                longitude: -80.5456,
                accuracy: 6
            }),
            watchId: 42
        });
        const onPosition = vi.fn();
        const onError = vi.fn();

        const stop = new BrowserGeolocationService(geolocation).watchPosition(onPosition, onError);

        expect(onPosition).toHaveBeenCalledWith({
            coordinates: {
                latitude: 43.4731,
                longitude: -80.5456
            },
            accuracyMeters: 6,
            timestamp: 1720000000000
        });
        expect(onError).not.toHaveBeenCalled();

        stop();
        expect(geolocation.clearWatch).toHaveBeenCalledWith(42);
    });

    it('normalizes permission-denied errors', async () => {
        const service = new BrowserGeolocationService(makeGeolocation({
            error: makeError(1, 'denied')
        }));

        await expect(service.getCurrentPosition()).rejects.toMatchObject({
            code: 'permission-denied',
            message: 'Location permission was denied.'
        });
    });

    it('normalizes unavailable and timeout errors', () => {
        expect(normalizeGeolocationError(makeError(2))).toMatchObject({
            code: 'position-unavailable'
        });
        expect(normalizeGeolocationError(makeError(3))).toMatchObject({
            code: 'timeout'
        });
    });

    it('reports unsupported browsers without touching routing or maps', async () => {
        const service = new BrowserGeolocationService(null);

        await expect(service.getCurrentPosition()).rejects.toBeInstanceOf(LocationError);
        await expect(service.getCurrentPosition()).rejects.toMatchObject({
            code: 'unsupported-browser'
        });
    });
});
