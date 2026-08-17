import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    isLoading?: boolean;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'border-primary bg-primary text-white hover:bg-primary/90 active:bg-primary/85',
    secondary: 'border-border bg-surface text-text-primary hover:border-primary/40 hover:bg-surface-raised active:bg-background',
    ghost: 'border-transparent bg-transparent text-text-primary hover:bg-surface-raised active:bg-background'
};

export default function Button({
    variant = 'primary',
    isLoading = false,
    disabled,
    leadingIcon,
    trailingIcon,
    children,
    className,
    type = 'button',
    ...props
}: ButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            aria-busy={isLoading || undefined}
            className={cx(
                'inline-flex min-h-touch items-center justify-center gap-2 rounded-control border px-4 py-2 text-wg-body font-semibold transition disabled:cursor-not-allowed disabled:opacity-55',
                'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {isLoading ? <span aria-hidden="true" className="size-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" /> : leadingIcon}
            <span>{children}</span>
            {trailingIcon}
        </button>
    );
}
