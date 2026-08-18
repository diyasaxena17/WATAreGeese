import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BuildingFloor, Coordinate, GraphLocation, Location, Route } from '../../routing/types';
import DirectionsPanel from './DirectionsPanel';
import { getRouteSummaryLines } from './RouteSummary';

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
                renderDirectionItem={({ order, graphLocation }) => (
                    <div>Step {order}: {graphLocation.location.buildingFloor.buildingCode}</div>
                )}
            />
        );

        expect(screen.getByText('Time: 8min, Distance: 650m')).toBeInTheDocument();
        expect(screen.getByText('⬆️1 floors, ⬇️ 0 floors')).toBeInTheDocument();
        expect(screen.getByText('Step 1: E7')).toBeInTheDocument();
    });

    it('renders the no-route state', () => {
        render(
            <DirectionsPanel
                variant="desktop"
                route={null}
                renderDirectionItem={() => null}
            />
        );

        expect(screen.getByText('No routes found :(')).toBeInTheDocument();
    });

    it('wires mobile direction controls without calculating routes', () => {
        const onPreviousDirection = vi.fn();
        const onNextDirection = vi.fn();

        render(
            <DirectionsPanel
                variant="mobile"
                route={makeRoute()}
                currentDirection={1}
                onPreviousDirection={onPreviousDirection}
                onNextDirection={onNextDirection}
                renderDirectionItem={() => <div>Current step</div>}
            />
        );

        fireEvent.click(screen.getByText('◀️'));
        fireEvent.click(screen.getByText('▶️'));

        expect(onPreviousDirection).toHaveBeenCalledTimes(1);
        expect(onNextDirection).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Current step')).toBeInTheDocument();
    });

    it('keeps inherited route summary formatting stable', () => {
        expect(getRouteSummaryLines(makeRoute())).toEqual([
            'Time: 8min, Distance: 650m',
            '⬆️1 floors, ⬇️ 0 floors'
        ]);
    });
});
