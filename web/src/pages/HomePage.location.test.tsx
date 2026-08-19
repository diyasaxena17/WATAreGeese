import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LocationError } from '../features/location';
import { LocationService, UserPosition } from '../features/location/types';
import HomePage from './HomePage';

const recenterUserLocation = vi.fn();

vi.mock('../map-rendering', () => ({
	useMapRenderer: () => ({
		mapElement: <div>Map area</div>,
		isReady: true,
		canRenderDirections: false,
		syncStartLocation: () => null,
		syncEndLocation: () => null,
		setLocationMarkers: vi.fn(),
		displayRoute: vi.fn(() => () => {}),
		recenterUserLocation
	})
}));

const position: UserPosition = {
	coordinates: {
		latitude: 43.4723,
		longitude: -80.5449
	},
	accuracyMeters: 10,
	timestamp: 1720000000000
};

function makeService(result: UserPosition | Promise<UserPosition>): LocationService {
	return {
		getCurrentPosition: vi.fn(() => Promise.resolve(result))
	};
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>(promiseResolve => {
		resolve = promiseResolve;
	});
	return { promise, resolve };
}

describe('HomePage current location UX', () => {
	beforeEach(() => {
		recenterUserLocation.mockClear();
	});

	it('does not request location on page load and exposes an accessible control', () => {
		const service = makeService(position);

		render(<HomePage locationService={service} />);

		expect(service.getCurrentPosition).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: 'Use current location' })).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);
	});

	it('requests and recenters on current location after explicit activation', async () => {
		const user = userEvent.setup();
		const service = makeService(position);

		render(<HomePage locationService={service} />);

		await user.click(screen.getByRole('button', { name: 'Use current location' }));

		expect(service.getCurrentPosition).toHaveBeenCalledTimes(1);
		expect(recenterUserLocation).toHaveBeenCalledWith(position);
		expect(await screen.findByRole('button', { name: 'Recenter on current location' })).toBeInTheDocument();
	});

	it('shows non-blocking feedback while requesting location', async () => {
		const user = userEvent.setup();
		const request = deferred<UserPosition>();
		const service = makeService(request.promise);

		render(<HomePage locationService={service} />);

		await user.click(screen.getByRole('button', { name: 'Use current location' }));

		expect(screen.getByRole('status')).toHaveTextContent('Finding your location...');
		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);

		request.resolve(position);
		expect(await screen.findByRole('button', { name: 'Recenter on current location' })).toBeInTheDocument();
	});

	it('shows permission denied feedback while keeping route planning usable', async () => {
		const user = userEvent.setup();
		const service: LocationService = {
			getCurrentPosition: vi.fn(() => Promise.reject(new LocationError('permission-denied', 'Denied')))
		};

		render(<HomePage locationService={service} />);

		await user.click(screen.getByRole('button', { name: 'Use current location' }));

		expect(await screen.findByText(/Location access was denied/i)).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);
		screen.getAllByRole('button', { name: /find route/i }).forEach(button => {
			expect(button).toBeDisabled();
		});
	});

	it('shows unavailable feedback without breaking building-to-building routing controls', async () => {
		const user = userEvent.setup();
		const service: LocationService = {
			getCurrentPosition: vi.fn(() => Promise.reject(new LocationError('position-unavailable', 'Unavailable')))
		};

		render(<HomePage locationService={service} />);

		await user.click(screen.getByRole('button', { name: 'Use current location' }));

		expect(await screen.findByText(/Current location is unavailable/i)).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /tochoose destination/i })).toHaveLength(2);
	});
});
