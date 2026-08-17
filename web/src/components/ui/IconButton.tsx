import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
    'aria-label': string;
    icon: ReactNode;
    pressed?: boolean;
};

export default function IconButton({
    icon,
    pressed,
    className,
    type = 'button',
    ...props
}: IconButtonProps) {
    return (
        <button
            type={type}
            aria-pressed={pressed}
            className={cx(
                'inline-flex size-touch shrink-0 items-center justify-center rounded-control border border-border bg-surface text-text-primary shadow-subtle transition',
                'hover:border-primary/40 hover:bg-surface-raised active:translate-y-px active:bg-background disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0',
                'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                pressed && 'border-primary bg-accent/25 text-primary',
                className
            )}
            {...props}
        >
            <span aria-hidden="true" className="inline-flex size-5 items-center justify-center">
                {icon}
            </span>
        </button>
    );
}
