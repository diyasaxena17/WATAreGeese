import { ButtonHTMLAttributes } from 'react';
import { cx } from './utils';

export type ChipVariant = 'default' | 'selected' | 'disabled';

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ChipVariant;
};

export default function Chip({
    variant = 'default',
    disabled,
    className,
    type = 'button',
    ...props
}: ChipProps) {
    const isDisabled = disabled || variant == 'disabled';

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-pressed={variant == 'selected'}
            className={cx(
                'inline-flex min-h-9 items-center rounded-full border px-3 text-wg-body-secondary font-semibold transition',
                'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                variant == 'default' && 'border-border bg-surface text-text-secondary hover:border-primary/35 hover:text-text-primary',
                variant == 'selected' && 'border-primary bg-accent/25 text-primary',
                variant == 'disabled' && 'cursor-not-allowed border-border bg-background text-text-secondary opacity-55',
                className
            )}
            {...props}
        />
    );
}
