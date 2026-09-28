import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LocationError } from './errors';
import { BrowserGeolocationService } from './geolocationService';
import {
    LocationRequestOptions,
    LocationService,
    UserLocationStatus,
    UserPosition
} from './types';

export type UseUserLocationState = {
    position: UserPosition | null;
    status: UserLocationStatus;
    error: LocationError | null;
    requestLocation: (options?: LocationRequestOptions) => Promise<UserPosition | null>;
    clearLocation: () => void;
};

export function useUserLocation(service?: LocationService): UseUserLocationState {
    const locationService = useMemo(() => service ?? new BrowserGeolocationService(), [service]);
    const requestIdRef = useRef(0);
    const watchStopRef = useRef<(() => void) | null>(null);
    const [position, setPosition] = useState<UserPosition | null>(null);
    const [status, setStatus] = useState<UserLocationStatus>('idle');
    const [error, setError] = useState<LocationError | null>(null);

    const stopWatching = useCallback(() => {
        watchStopRef.current?.();
        watchStopRef.current = null;
    }, []);

    useEffect(() => () => stopWatching(), [locationService, stopWatching]);

    const requestLocation = async (options?: LocationRequestOptions) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        stopWatching();
        setStatus('requesting');
        setError(null);

        try {
            const nextPosition = await locationService.getCurrentPosition(options);
            if(requestIdRef.current != requestId) return nextPosition;
            setPosition(nextPosition);
            setStatus('available');
            if(locationService.watchPosition) {
                watchStopRef.current = locationService.watchPosition(
                    watchedPosition => {
                        if(requestIdRef.current != requestId) return;
                        setPosition(watchedPosition);
                        setStatus('available');
                        setError(null);
                    },
                    caughtError => {
                        if(requestIdRef.current != requestId) return;
                        const locationError = toLocationError(caughtError);
                        if(locationError.code == 'permission-denied') setPosition(null);
                        setError(locationError);
                        setStatus(statusForError(locationError));
                    },
                    options
                );
            }
            return nextPosition;
        } catch (caughtError) {
            const locationError = toLocationError(caughtError);
            if(requestIdRef.current != requestId) return null;
            setPosition(null);
            setError(locationError);
            setStatus(statusForError(locationError));
            return null;
        }
    };

    const clearLocation = () => {
        requestIdRef.current += 1;
        stopWatching();
        setPosition(null);
        setStatus('idle');
        setError(null);
    };

    return {
        position,
        status,
        error,
        requestLocation,
        clearLocation
    };
}

function toLocationError(error: unknown) {
    if(error instanceof LocationError) return error;
    return new LocationError('unknown', 'Unable to determine your current location.');
}

function statusForError(error: LocationError): UserLocationStatus {
    if(error.code == 'permission-denied') return 'denied';
    if(error.code == 'position-unavailable' || error.code == 'timeout' || error.code == 'unsupported-browser') {
        return 'unavailable';
    }
    return 'error';
}
