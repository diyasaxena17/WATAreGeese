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

function makeMultiStepRoute() {
    const start = new GraphLocation(makeLocation('DC'), [], null, null, 0, 0, 0, 0, 0, 0);
    const middle = new GraphLocation(makeLocation('MC'), [[-80.543, 43.472]], start, 'hallway', 120, 90, 0, 0, 0, 0);
    const end = new GraphLocation(makeLocation('E7'), [[-80.544, 43.473]], middle, 'bridge', 650, 480, 0, 0, 1, 0);
    return new Route([start, middle, end]);
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

    it('renders directions in route order', () => {
        render(
            <DirectionsPanel
                variant="desktop"
                route={makeMultiStepRoute()}
                selectedDirection={null}
                onHighlightDirection={vi.fn()}
                onClearHighlight={vi.fn()}
                onSelectDirection={vi.fn()}
            />
        );

        const rows = screen.getAllByRole('button');

        expect(rows[0]).toHaveTextContent('1');
        expect(rows[0]).toHaveTextContent('Take the hallway on MC floor 1');
        expect(rows[1]).toHaveTextContent('2');
        expect(rows[1]).toHaveTextContent('Take the bridge to E7 floor 1');
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

    it('keeps clicked direction rows selected until the user clicks away', () => {
        const onHighlightDirection = vi.fn();
        const onClearHighlight = vi.fn();
        const onSelectDirection = vi.fn();

        render(
            <DirectionsPanel
                variant="mobile"
                route={makeRoute()}
                selectedDirection={null}
                onHighlightDirection={onHighlightDirection}
                onClearHighlight={onClearHighlight}
                onSelectDirection={onSelectDirection}
            />
        );

        const step = screen.getByRole('button', { name: /1take the hallway on e7 floor 1hallway/i });
        fireEvent.mouseEnter(step);
        fireEvent.click(step);
        fireEvent.mouseLeave(step);

        expect(onHighlightDirection).not.toHaveBeenCalled();
        expect(onSelectDirection).toHaveBeenCalledWith(1);
        expect(onClearHighlight).not.toHaveBeenCalled();
        expect(step).not.toHaveAttribute('aria-current', 'step');

        fireEvent.pointerDown(document.body);
        expect(onClearHighlight).not.toHaveBeenCalled();
    });

    it('selects another direction step without clearing through hover state', () => {
        const onClearHighlight = vi.fn();
        const onSelectDirection = vi.fn();

        render(
            <DirectionsPanel
                variant="desktop"
                route={makeMultiStepRoute()}
                selectedDirection={1}
                onHighlightDirection={vi.fn()}
                onClearHighlight={onClearHighlight}
                onSelectDirection={onSelectDirection}
            />
        );

        const secondStep = screen.getByRole('button', { name: /2take the bridge to e7 floor 1bridge/i });
        fireEvent.click(secondStep);

        expect(onSelectDirection).toHaveBeenCalledWith(2);
        expect(onClearHighlight).not.toHaveBeenCalled();
    });

    it('keeps mobile direction selection when the sheet is dragged or minimized', () => {
        const onClearHighlight = vi.fn();

        render(
            <DirectionsPanel
                variant="mobile"
                route={makeMultiStepRoute()}
                selectedDirection={1}
                onHighlightDirection={vi.fn()}
                onClearHighlight={onClearHighlight}
                onSelectDirection={vi.fn()}
            />
        );

		fireEvent.pointerDown(document.body);

		expect(onClearHighlight).not.toHaveBeenCalled();
		expect(screen.getByRole('button', { name: /1take the hallway on mc floor 1hallway.*selected/i }))
			.toHaveAttribute('aria-current', 'step');
	});

    it('keeps the mobile directions list compact so map content remains visible above the sheet', () => {
        const { container } = render(
            <DirectionsPanel
                variant="mobile"
                route={makeMultiStepRoute()}
                selectedDirection={1}
                onHighlightDirection={vi.fn()}
                onClearHighlight={vi.fn()}
                onSelectDirection={vi.fn()}
            />
        );

        expect(container.innerHTML).toContain('max-h-[min(30svh,16rem)]');
    });

    it('clears the selected direction when the selected step is clicked again', () => {
        const onClearHighlight = vi.fn();
        const onSelectDirection = vi.fn();

        render(
            <DirectionsPanel
                variant="desktop"
                route={makeMultiStepRoute()}
                selectedDirection={1}
                onHighlightDirection={vi.fn()}
                onClearHighlight={onClearHighlight}
                onSelectDirection={onSelectDirection}
            />
        );

        const selectedStep = screen.getByRole('button', { name: /1take the hallway on mc floor 1hallway/i });
        fireEvent.click(selectedStep);

        expect(onClearHighlight).toHaveBeenCalledTimes(1);
        expect(onSelectDirection).not.toHaveBeenCalled();
    });

    it('toggles off a selected step when both responsive panels are mounted', () => {
        const onClearHighlight = vi.fn();
        const onSelectDirection = vi.fn();
        const route = makeMultiStepRoute();

        render(
            <>
                <DirectionsPanel
                    variant="desktop"
                    route={route}
                    selectedDirection={1}
                    onHighlightDirection={vi.fn()}
                    onClearHighlight={onClearHighlight}
                    onSelectDirection={onSelectDirection}
                />
                <DirectionsPanel
                    variant="mobile"
                    route={route}
                    selectedDirection={1}
                    onHighlightDirection={vi.fn()}
                    onClearHighlight={onClearHighlight}
                    onSelectDirection={onSelectDirection}
                />
            </>
        );

        const selectedSteps = screen.getAllByRole('button', { name: /1take the hallway on mc floor 1hallway/i });
        fireEvent.pointerDown(selectedSteps[0]);
        fireEvent.click(selectedSteps[0]);

        expect(onClearHighlight).toHaveBeenCalledTimes(1);
        expect(onSelectDirection).not.toHaveBeenCalled();
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
