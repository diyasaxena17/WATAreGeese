import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LocationError } from './errors';
import { LocationService, UserPosition } from './types';
import { useUserLocation } from './useUserLocation';

const userPosition: UserPosition = {
    coordinates: {
        latitude: 43.4723,
        longitude: -80.5449
    },
    accuracyMeters: 9,
    timestamp: 1720000000000
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((promiseResolve, promiseReject) => {
        resolve = promiseResolve;
        reject = promiseReject;
    });
    return { promise, resolve, reject };
}

function makeService(result: Promise<UserPosition> | UserPosition): LocationService {
    return {
        getCurrentPosition: vi.fn(() => Promise.resolve(result))
    };
}

function LocationHarness({ service }: { service: LocationService }) {
    const {
        position,
        status,
        error,
        requestLocation,
        clearLocation
    } = useUserLocation(service);

    return (
        <div>
            <div>Status: {status}</div>
            <div>Latitude: {position?.coordinates.latitude ?? 'none'}</div>
            <div>Longitude: {position?.coordinates.longitude ?? 'none'}</div>
            <div>Error: {error?.code ?? 'none'}</div>
            <button type="button" onClick={() => requestLocation()}>Request</button>
            <button type="button" onClick={clearLocation}>Clear</button>
        </div>
    );
}

describe('useUserLocation', () => {
    it('starts idle and does not request location on mount', () => {
        const service = makeService(userPosition);

        render(<LocationHarness service={service} />);

        expect(screen.getByText('Status: idle')).toBeInTheDocument();
        expect(service.getCurrentPosition).not.toHaveBeenCalled();
    });

    it('exposes requesting state while location is pending', async () => {
        const request = deferred<UserPosition>();
        const service = makeService(request.promise);
        const user = userEvent.setup();

        render(<LocationHarness service={service} />);

        await user.click(screen.getByRole('button', { name: 'Request' }));

        expect(screen.getByText('Status: requesting')).toBeInTheDocument();

        request.resolve(userPosition);
        await screen.findByText('Status: available');
    });

    it('stores successful location state', async () => {
        const service = makeService(userPosition);
        const user = userEvent.setup();

        render(<LocationHarness service={service} />);

        await user.click(screen.getByRole('button', { name: 'Request' }));

        await screen.findByText('Status: available');
        expect(screen.getByText('Latitude: 43.4723')).toBeInTheDocument();
        expect(screen.getByText('Longitude: -80.5449')).toBeInTheDocument();
        expect(screen.getByText('Error: none')).toBeInTheDocument();
    });

    it('maps permission denied to denied state', async () => {
        const service: LocationService = {
            getCurrentPosition: vi.fn(() => Promise.reject(new LocationError('permission-denied', 'Denied')))
        };
        const user = userEvent.setup();

        render(<LocationHarness service={service} />);

        await user.click(screen.getByRole('button', { name: 'Request' }));

        await screen.findByText('Status: denied');
        expect(screen.getByText('Error: permission-denied')).toBeInTheDocument();
        expect(screen.getByText('Latitude: none')).toBeInTheDocument();
    });

    it('can retry after an error', async () => {
        const service: LocationService = {
            getCurrentPosition: vi.fn()
                .mockRejectedValueOnce(new LocationError('timeout', 'Timed out'))
                .mockResolvedValueOnce(userPosition)
        };
        const user = userEvent.setup();

        render(<LocationHarness service={service} />);

        await user.click(screen.getByRole('button', { name: 'Request' }));
        await screen.findByText('Status: unavailable');
        expect(screen.getByText('Error: timeout')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Request' }));
        await screen.findByText('Status: available');

        expect(screen.getByText('Error: none')).toBeInTheDocument();
        expect(screen.getByText('Latitude: 43.4723')).toBeInTheDocument();
        expect(service.getCurrentPosition).toHaveBeenCalledTimes(2);
    });

    it('clears location state back to idle memory state', async () => {
        const service = makeService(userPosition);
        const user = userEvent.setup();

        render(<LocationHarness service={service} />);

        await user.click(screen.getByRole('button', { name: 'Request' }));
        await screen.findByText('Status: available');

        await user.click(screen.getByRole('button', { name: 'Clear' }));

        await waitFor(() => {
            expect(screen.getByText('Status: idle')).toBeInTheDocument();
        });
        expect(screen.getByText('Latitude: none')).toBeInTheDocument();
    });
});
