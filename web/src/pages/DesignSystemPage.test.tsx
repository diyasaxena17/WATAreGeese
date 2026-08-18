import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DesignSystemPage from './DesignSystemPage';

describe('DesignSystemPage', () => {
    it('renders the primitive showcase for local inspection', () => {
        render(<DesignSystemPage />);

        expect(screen.getAllByText('WATAreGeese UI').length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: /primary/i })[0]).toBeInTheDocument();
        expect(screen.getAllByRole('searchbox', { name: /search buildings/i })[0]).toBeInTheDocument();
        expect(screen.getAllByText('Davis Centre')[0]).toBeInTheDocument();
        expect(screen.getAllByText('8 min')[0]).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /recenter map/i })).toBeInTheDocument();
    });

    it.each([
        ['phone', 390],
        ['tablet', 768],
        ['desktop', 1280]
    ])('renders at %s width', (_label, width) => {
        window.innerWidth = width;
        window.dispatchEvent(new Event('resize'));

        render(<DesignSystemPage />);

        expect(screen.getByText('Map/content area')).toBeInTheDocument();
        expect(screen.getAllByText('Route planner')[0]).toBeInTheDocument();
    });
});
