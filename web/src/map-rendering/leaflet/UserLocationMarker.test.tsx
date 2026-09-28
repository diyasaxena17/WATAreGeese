import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UserPosition } from '../../features/location';
import UserLocationMarker from './UserLocationMarker';
import { toLeafletUserPosition } from './userLocationCoordinates';

vi.mock('react-leaflet', () => ({
    Circle: ({ center, radius }: { center: [number, number]; radius: number }) => (
        <div data-testid="accuracy-circle">
            {center.join(',')}:{radius}
        </div>
    ),
    CircleMarker: ({ center, radius }: { center: [number, number]; radius: number }) => (
        <div data-testid="user-location-dot">
            {center.join(',')}:{radius}
        </div>
    )
}));

const position: UserPosition = {
    coordinates: {
        latitude: 43.4723,
        longitude: -80.5449
    },
    accuracyMeters: 14,
    timestamp: 1720000000000
};

describe('UserLocationMarker', () => {
    it('is absent when position is null', () => {
        render(<UserLocationMarker position={null} />);

        expect(screen.queryByTestId('user-location-dot')).not.toBeInTheDocument();
        expect(screen.queryByTestId('accuracy-circle')).not.toBeInTheDocument();
    });

    it('renders the user marker and accuracy circle when position exists', () => {
        render(<UserLocationMarker position={position} />);

        const markerRings = screen.getAllByTestId('user-location-dot');
        expect(markerRings).toHaveLength(2);
        expect(markerRings[0]).toHaveTextContent('43.4723,-80.5449:9');
        expect(markerRings[1]).toHaveTextContent('43.4723,-80.5449:6');
        expect(screen.getByTestId('accuracy-circle')).toHaveTextContent('43.4723,-80.5449:14');
    });

    it('omits the accuracy circle when accuracy is unavailable', () => {
        render(<UserLocationMarker position={{ ...position, accuracyMeters: undefined }} />);

        expect(screen.getAllByTestId('user-location-dot')).toHaveLength(2);
        expect(screen.queryByTestId('accuracy-circle')).not.toBeInTheDocument();
    });

    it('forwards normalized latitude and longitude in Leaflet order', () => {
        expect(toLeafletUserPosition(position)).toEqual([43.4723, -80.5449]);
    });
});
