import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import HomePage from './HomePage';

vi.mock('../map-rendering', () => ({
	useMapRenderer: () => ({
		mapElement: <div>Map area</div>,
		isReady: true,
		canRenderDirections: false,
		syncStartLocation: () => null,
		syncEndLocation: () => null,
		setLocationMarkers: vi.fn(),
		displayRoute: vi.fn(() => () => {}),
		renderDirectionItem: vi.fn()
	})
}));

describe('HomePage mobile sheet', () => {
	it('can be dragged down and restored', async () => {
		const user = userEvent.setup();
		render(<HomePage />);

		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);

		const handle = screen.getByRole('button', { name: /drag route planner down to minimize/i });
		fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
		fireEvent.pointerUp(handle, { clientY: 220, pointerId: 1 });

		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(1);
		expect(screen.getByRole('button', { name: /plan route/i })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /plan route/i }));

		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);
	});
});
