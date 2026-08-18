import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BuildingFloor, Coordinate, GraphLocation, Location, Route } from '../../routing/types';
import DirectionsPanel from './DirectionsPanel';
import { formatRouteDistance, getRouteMetrics, getRouteSummaryLines } from './routeMetrics';

function makeLocation(buildingCode: string, floor = '1') {
    return new Location(
        new Coordinate([-80.543, 43.472]),
        new BuildingFloor({ buildingCode, floor })
    );
}

function makeRoute() {
    const start = new GraphLocation(makeLocation('DC'), [], null, null, 0, 0, 0, 0, 0, 0);
    const end = new GraphLocation(makeLocation('E7'), [[-80.543, 43.472]], start, 'hallway', 650, 480, 0, 0, 1, 0);
    return new Route([start, end]);
}

describe('DirectionsPanel', () => {
    it('renders route summary and direction steps from route data', () => {
        const route = makeRoute();

        render(
            <DirectionsPanel
                variant="desktop"
                route={route}
                from={{ id: 'DC', code: 'DC', name: 'Davis Centre' }}
                to={{ id: 'E7', code: 'E7', name: 'Engineering 7' }}
                selectedDirection={null}
                onHighlightDirection={vi.fn()}
                onClearHighlight={vi.fn()}
                onSelectDirection={vi.fn()}
            />
        );

        expect(screen.getByText('DC → E7')).toBeInTheDocument();
        expect(screen.getByText('Davis Centre')).toBeInTheDocument();
        expect(screen.getByText('Engineering 7')).toBeInTheDocument();
        expect(screen.getByText('650 m')).toBeInTheDocument();
        expect(screen.getByText('Directions')).toBeInTheDocument();
        expect(screen.getByText(/Take the hallway on E7 floor 1/i)).toBeInTheDocument();
        expect(screen.getByText('hallway')).toBeInTheDocument();
    });

    it('renders the no-route state', () => {
        render(
            <DirectionsPanel
                variant="desktop"
                route={null}
                selectedDirection={null}
                onHighlightDirection={vi.fn()}
                onClearHighlight={vi.fn()}
                onSelectDirection={vi.fn()}
            />
        );

        expect(screen.getByText('No route found')).toBeInTheDocument();
    });

    it('wires shared direction rows to application highlight state', () => {
        const onHighlightDirection = vi.fn();
        const onClearHighlight = vi.fn();
        const onSelectDirection = vi.fn();

        render(
            <DirectionsPanel
                variant="mobile"
                route={makeRoute()}
                selectedDirection={1}
                onHighlightDirection={onHighlightDirection}
                onClearHighlight={onClearHighlight}
                onSelectDirection={onSelectDirection}
            />
        );

        const step = screen.getByRole('button', { name: /1take the hallway on e7 floor 1hallway/i });
        fireEvent.mouseEnter(step);
        fireEvent.click(step);
        fireEvent.mouseLeave(step);

        expect(onHighlightDirection).toHaveBeenCalledWith(1);
        expect(onSelectDirection).toHaveBeenCalledWith(1);
        expect(onClearHighlight).toHaveBeenCalledTimes(1);
    });

    it('keeps inherited route summary formatting stable', () => {
        expect(getRouteSummaryLines(makeRoute())).toEqual([
            'Time: 8min, Distance: 650m',
            '⬆️1 floors, ⬇️ 0 floors'
        ]);
    });

    it('formats real route metrics for compact display', () => {
        expect(formatRouteDistance(650)).toBe('650 m');
        expect(formatRouteDistance(1240)).toBe('1.2 km');
        expect(getRouteMetrics(makeRoute())).toEqual([
            { label: 'Distance', value: '650 m' },
            { label: 'Segments', value: '1' }
        ]);
    });

    it('calls Change route without changing endpoint data', () => {
        const onChangeRoute = vi.fn();

        render(
            <DirectionsPanel
                variant="desktop"
                route={makeRoute()}
                from={{ id: 'DC', code: 'DC', name: 'Davis Centre' }}
                to={{ id: 'E7', code: 'E7', name: 'Engineering 7' }}
                onChangeRoute={onChangeRoute}
                selectedDirection={null}
                onHighlightDirection={vi.fn()}
                onClearHighlight={vi.fn()}
                onSelectDirection={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Change route' }));

        expect(onChangeRoute).toHaveBeenCalledTimes(1);
        expect(screen.getByText('DC → E7')).toBeInTheDocument();
    });
});
