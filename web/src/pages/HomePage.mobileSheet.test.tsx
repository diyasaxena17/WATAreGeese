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
		focusLocation: vi.fn(),
		setLocationMarkers: vi.fn(),
		displayRoute: vi.fn(() => () => {}),
		recenterUserLocation: vi.fn()
	})
}));

describe('HomePage mobile sheet', () => {
	it('supports medium, minimized, and restored detents', async () => {
		const user = userEvent.setup();
		const { container } = render(<HomePage />);

		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);

		const handle = screen.getByRole('button', { name: /drag route planner to resize/i });
		fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
		fireEvent.pointerUp(handle, { clientY: 220, pointerId: 1 });

		expect(container.querySelector('.h-\\[58svh\\]')).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);

		fireEvent.pointerDown(handle, { clientY: 100, pointerId: 2 });
		fireEvent.pointerUp(handle, { clientY: 220, pointerId: 2 });

		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(1);
		expect(screen.getByRole('button', { name: /plan route/i })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /plan route/i }));

		expect(screen.getAllByRole('button', { name: /fromchoose starting point/i })).toHaveLength(2);
	});

	it('can be expanded from the medium detent', () => {
		const { container } = render(<HomePage />);
		const handle = screen.getByRole('button', { name: /drag route planner to resize/i });

		fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
		fireEvent.pointerUp(handle, { clientY: 220, pointerId: 1 });
		expect(container.querySelector('.h-\\[58svh\\]')).toBeInTheDocument();

		fireEvent.pointerDown(handle, { clientY: 220, pointerId: 2 });
		fireEvent.pointerUp(handle, { clientY: 100, pointerId: 2 });
		expect(container.querySelector('.h-\\[88svh\\]')).toBeInTheDocument();
	});
});
