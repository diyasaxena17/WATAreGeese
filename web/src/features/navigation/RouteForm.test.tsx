import { FormEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { searchBuildings } from '../../campus-data/buildingSearch';
import RouteForm from './RouteForm';

function renderRouteForm(overrides = {}) {
	const props = {
		from: null,
		to: null,
		onFromChange: vi.fn(),
		onToChange: vi.fn(),
		onSwap: vi.fn(),
		onSubmit: vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault()),
		...overrides
	};

	render(<RouteForm {...props} />);
	return props;
}

describe('RouteForm', () => {
	it('disables Find route until both locations are selected', () => {
		renderRouteForm();

		expect(screen.getByRole('button', { name: /find route/i })).toBeDisabled();
	});

	it('searches buildings by alias and selects From', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm();

		await user.type(screen.getByRole('searchbox', { name: /search starting point/i }), 'Davis');
		await user.click(screen.getByRole('button', { name: /dcwilliam g\. davis/i }));

		expect(props.onFromChange).toHaveBeenCalledWith(expect.objectContaining({
			id: 'DC',
			buildingCode: 'DC'
		}));
		expect(props.onToChange).not.toHaveBeenCalled();
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

	it('swaps selected locations without submitting the form', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm({
			from: searchBuildings('DC')[0],
			to: searchBuildings('E7')[0]
		});

		await user.click(screen.getByRole('button', { name: /swap start and destination/i }));

		expect(props.onSwap).toHaveBeenCalledTimes(1);
		expect(props.onSubmit).not.toHaveBeenCalled();
	});

	it('submits only when both locations are selected', async () => {
		const user = userEvent.setup();
		const props = renderRouteForm({
			from: searchBuildings('DC')[0],
			to: searchBuildings('E7')[0]
		});

		await user.click(screen.getByRole('button', { name: /find route/i }));

		expect(props.onSubmit).toHaveBeenCalledTimes(1);
	});
});
