import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Button from './Button';
import Chip from './Chip';
import IconButton from './IconButton';
import LocationField from './LocationField';
import SearchInput from './SearchInput';

describe('ui primitives', () => {
    it('prevents Button actions while disabled', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<Button disabled onClick={onClick}>Start route</Button>);
        await user.click(screen.getByRole('button', { name: /start route/i }));

        expect(onClick).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: /start route/i })).toBeDisabled();
    });

    it('requires IconButton actions to be reachable by accessible label', () => {
        render(<IconButton aria-label="Recenter map" icon={<span>◎</span>} />);

        expect(screen.getByRole('button', { name: /recenter map/i })).toBeInTheDocument();
    });

    it('clears SearchInput values through the clear action', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onClear = vi.fn();

        render(
            <SearchInput
                label="Search buildings"
                value="Davis"
                onChange={onChange}
                onClear={onClear}
            />
        );

        await user.click(screen.getByRole('button', { name: /clear search/i }));

        expect(onChange).toHaveBeenCalledWith('');
        expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('renders LocationField empty and selected states', () => {
        const { rerender } = render(
            <LocationField label="From" state="empty" primaryText="Choose origin" />
        );

        expect(screen.getByText('From')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /from\s*choose origin/i })).toBeInTheDocument();

        rerender(
            <LocationField
                label="To"
                state="selected"
                primaryText="Davis Centre"
                secondaryText="DC"
            />
        );

        expect(screen.getByRole('button', { name: /to\s*davis centre\s*dc/i })).toBeInTheDocument();
    });

    it('exposes Chip selected and disabled states', () => {
        render(
            <div>
                <Chip variant="selected">Indoors</Chip>
                <Chip variant="disabled">Accessible</Chip>
            </div>
        );

        expect(screen.getByRole('button', { name: /indoors/i })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /accessible/i })).toBeDisabled();
    });
});
