import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AppShell from './AppShell';

describe('AppShell', () => {
    it('renders shared map, panel, sheet, and map controls without duplicating content trees', () => {
        render(
            <AppShell
                map={<div>Map area</div>}
                panel={<div>Panel content</div>}
                sheet={<div>Sheet content</div>}
                mapControls={<button type="button">Recenter</button>}
            />
        );

        expect(screen.getByText('Map area')).toBeInTheDocument();
        expect(screen.getByText('Panel content')).toBeInTheDocument();
        expect(screen.getByText('Sheet content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /recenter/i })).toBeInTheDocument();
    });

    it('layers mobile sheet and map controls above Leaflet panes', () => {
        render(
            <AppShell
                map={<div>Map area</div>}
                sheet={<div>Sheet content</div>}
                mapControls={<button type="button">Recenter</button>}
            />
        );

        expect(screen.getByText('Sheet content').parentElement).toHaveClass('z-[1100]');
        expect(screen.getByRole('button', { name: /recenter/i }).parentElement).toHaveClass('z-[1100]');
    });
});
