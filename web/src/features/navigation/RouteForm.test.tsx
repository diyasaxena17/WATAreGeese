import { FormEvent, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { searchBuildings } from '../../campus-data/buildingSearch';
import { BuildingSearchResult } from '../../campus-data/buildingSearch';
import RouteForm from './RouteForm';

function renderRouteForm(overrides = {}) {
	const props = {
		from: null,
		to: null,
		fromFloor: null,
		toFloor: null,
		onFromChange: vi.fn(),
		onToChange: vi.fn(),
		onFromFloorChange: vi.fn(),
		onToFloorChange: vi.fn(),
		onSwap: vi.fn(),
		onSubmit: vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
		...overrides
	};

	render(<RouteForm {...props} />);
	return props;
}

function StatefulRouteForm({ onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()) }) {
	const [from, setFrom] = useState<BuildingSearchResult | null>(null);
	const [to, setTo] = useState<BuildingSearchResult | null>(null);
	const [fromFloor, setFromFloor] = useState<string | null>(null);
	const [toFloor, setToFloor] = useState<string | null>(null);

	return (
		<RouteForm
			from={from}
			to={to}
			fromFloor={fromFloor}
			toFloor={toFloor}
			onFromChange={building => {
				setFrom(building);
				setFromFloor(defaultFloor(building.floors));
			}}
			onToChange={building => {
				setTo(building);
				setToFloor(defaultFloor(building.floors));
			}}
			onFromFloorChange={setFromFloor}
			onToFloorChange={setToFloor}
			onSwap={() => {
				setFrom(to);
				setTo(from);
				setFromFloor(toFloor);
				setToFloor(fromFloor);
			}}
			onSubmit={onSubmit}
		/>
	);
}

describe('RouteForm', () => {
	it('disables Find route until both locations are selected', () => {
		renderRouteForm();

		expect(screen.getByRole('button', { name: /find route/i })).toBeDisabled();
	});

	it('shows disabled floor fields before buildings are selected', () => {
		renderRouteForm();

		expect(screen.getByLabelText(/from floor/i)).toBeDisabled();
		expect(screen.getByLabelText(/to floor/i)).toBeDisabled();
	});

	it('searches buildings by alias and selects From', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm();

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));
		await user.type(screen.getByRole('searchbox', { name: /search starting point/i }), 'Davis');
		await user.click(screen.getByRole('button', { name: /dcwilliam g\. davis/i }));

		expect(props.onFromChange).toHaveBeenCalledWith(expect.objectContaining({
			id: 'DC',
			buildingCode: 'DC'
		}));
		expect(props.onToChange).not.toHaveBeenCalled();
		expect(screen.queryByRole('searchbox', { name: /search starting point/i })).not.toBeInTheDocument();
	});

	it('searches buildings by official name and selects To after From is selected', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm({
			from: searchBuildings('DC')[0]
		});

		await user.click(screen.getByRole('button', { name: /tochoose destination/i }));
		await user.type(screen.getByRole('searchbox', { name: /search destination/i }), 'Engineering 7');
		await user.click(screen.getByRole('button', { name: /e7engineering 7/i }));

		expect(props.onToChange).toHaveBeenCalledWith(expect.objectContaining({
			id: 'E7',
			buildingCode: 'E7'
		}));
	});

	it('enables Find route after both buildings are selected', async () => {
		const user = userEvent.setup();
		render(<StatefulRouteForm />);

		expect(screen.getByRole('button', { name: /find route/i })).toBeDisabled();

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));
		await user.type(screen.getByRole('searchbox', { name: /search starting point/i }), 'Davis');
		await user.click(screen.getByRole('button', { name: /dcwilliam g\. davis/i }));

		expect(screen.getByRole('button', { name: /find route/i })).toBeDisabled();
		expect(screen.getByRole('button', { name: /fromdcwilliam g\. davis.*floor 1/i })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /tochoose destination/i }));
		await user.type(screen.getByRole('searchbox', { name: /search destination/i }), 'E7');
		await user.click(screen.getByRole('button', { name: /e7engineering 7/i }));

		expect(screen.getByRole('button', { name: /find route/i })).toBeEnabled();
	});

	it('allows selected floors to be changed', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm({
			from: searchBuildings('DC')[0],
			fromFloor: '1'
		});

		await user.selectOptions(screen.getByLabelText(/from floor/i), '2');

		expect(props.onFromFloorChange).toHaveBeenCalledWith('2');
	});

	it('requires selected floors before submitting', () => {
		renderRouteForm({
			from: searchBuildings('DC')[0],
			to: searchBuildings('E7')[0],
			fromFloor: null,
			toFloor: '1'
		});

		expect(screen.getByRole('button', { name: /find route/i })).toBeDisabled();
	});

	it('reverses selected buildings when swap is clicked', async () => {
		const user = userEvent.setup();
		render(<StatefulRouteForm />);

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));
		await user.type(screen.getByRole('searchbox', { name: /search starting point/i }), 'DC');
		await user.click(screen.getByRole('button', { name: /dcwilliam g\. davis/i }));
		await user.click(screen.getByRole('button', { name: /tochoose destination/i }));
		await user.type(screen.getByRole('searchbox', { name: /search destination/i }), 'E7');
		await user.click(screen.getByRole('button', { name: /e7engineering 7/i }));
		await user.click(screen.getByRole('button', { name: /swap start and destination/i }));

		expect(screen.getByRole('button', { name: /frome7engineering 7.*floor 1/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /todcwilliam g\. davis.*floor 1/i })).toBeInTheDocument();
	});

	it('shows a useful building list before the query is typed', async () => {
		const user = userEvent.setup();
		renderRouteForm();

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));

		expect(screen.getByRole('searchbox', { name: /search starting point/i })).toHaveFocus();
		expect(screen.getByRole('button', { name: /dcwilliam g\. davis/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /current locationcoming soon/i })).toBeDisabled();
	});

	it('shows a no-results state for irrelevant queries', async () => {
		const user = userEvent.setup();
		renderRouteForm();

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));
		await user.type(screen.getByRole('searchbox', { name: /search starting point/i }), 'not a waterloo building');

		expect(screen.getByText('No buildings found.')).toBeInTheDocument();
	});

	it('closes the search surface with Escape', async () => {
		const user = userEvent.setup();
		renderRouteForm();

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));
		await user.keyboard('{Escape}');

		expect(screen.queryByRole('searchbox', { name: /search starting point/i })).not.toBeInTheDocument();
	});

	it('returns focus to the active field when search closes', async () => {
		const user = userEvent.setup();
		renderRouteForm();

		await user.click(screen.getByRole('button', { name: /tochoose destination/i }));
		await user.keyboard('{Escape}');

		await waitFor(() => {
			expect(screen.getByRole('button', { name: /tochoose destination/i })).toHaveFocus();
		});
	});

	it('supports keyboard navigation and Enter selection', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm();

		await user.click(screen.getByRole('button', { name: /fromchoose starting point/i }));
		await user.type(screen.getByRole('searchbox', { name: /search starting point/i }), 'DC');
		await user.keyboard('{Tab}');
		await user.keyboard('{Tab}');
		await user.keyboard('{Enter}');

		expect(props.onFromChange).toHaveBeenCalledWith(expect.objectContaining({
			id: 'DC',
			buildingCode: 'DC'
		}));
	});

	it('swaps selected locations without submitting the form', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm({
			from: searchBuildings('DC')[0],
			to: searchBuildings('E7')[0],
			fromFloor: '1',
			toFloor: '1'
		});

		await user.click(screen.getByRole('button', { name: /swap start and destination/i }));

		expect(props.onSwap).toHaveBeenCalledTimes(1);
		expect(props.onSubmit).not.toHaveBeenCalled();
	});

	it('submits only when both locations are selected', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm({
			from: searchBuildings('DC')[0],
			to: searchBuildings('E7')[0],
			fromFloor: '1',
			toFloor: '1'
		});

		await user.click(screen.getByRole('button', { name: /find route/i }));

		expect(props.onSubmit).toHaveBeenCalledTimes(1);
	});
});

function defaultFloor(floors: string[]) {
	return floors.includes('1') ? '1' : floors[0] ?? null;
}
