import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export type LocationFieldState = 'empty' | 'selected' | 'current-location' | 'disabled';

export type LocationFieldProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
    label: string;
    primaryText?: string;
    secondaryText?: string;
    state?: LocationFieldState;
    leadingIcon?: ReactNode;
    disabled?: boolean;
};

export default function LocationField({
    label,
    primaryText,
    secondaryText,
    state = 'empty',
    leadingIcon,
    disabled,
    className,
    type = 'button',
    ...props
}: LocationFieldProps) {
    const isDisabled = disabled || state == 'disabled';
    const displayText = primaryText ?? 'Choose location';

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={cx(
                'wg-control flex w-full items-center gap-3 px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-55',
                state == 'selected' && 'border-primary/40',
                state == 'current-location' && 'border-route/45',
                className
            )}
            {...props}
        >
            {leadingIcon ? <span aria-hidden="true" className="inline-flex size-5 items-center justify-center text-text-secondary">{leadingIcon}</span> : null}
            <span className="min-w-0 flex-1">
                <span className="wg-label block">{label}</span>
                <span className={cx('block truncate text-wg-body', state == 'empty' ? 'text-text-secondary' : 'text-text-primary')}>
                    {displayText}
                </span>
                {secondaryText ? <span className="block truncate text-wg-body-secondary">{secondaryText}</span> : null}
            </span>
        </button>
    );
}
