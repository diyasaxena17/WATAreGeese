import { useMemo, useRef, useState } from 'react';

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
    const [position, setPosition] = useState<UserPosition | null>(null);
    const [status, setStatus] = useState<UserLocationStatus>('idle');
    const [error, setError] = useState<LocationError | null>(null);

    const requestLocation = async (options?: LocationRequestOptions) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setStatus('requesting');
        setError(null);

        try {
            const nextPosition = await locationService.getCurrentPosition(options);
            if(requestIdRef.current != requestId) return nextPosition;
            setPosition(nextPosition);
            setStatus('available');
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
