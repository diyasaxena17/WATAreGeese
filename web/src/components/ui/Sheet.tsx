import { HTMLAttributes, PointerEvent, ReactNode } from 'react';
import { cx } from './utils';

export type SheetProps = HTMLAttributes<HTMLElement> & {
    header?: ReactNode;
    footer?: ReactNode;
    showHandle?: boolean;
    handleLabel?: string;
    onHandlePointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
    onHandlePointerUp?: (event: PointerEvent<HTMLButtonElement>) => void;
    onHandlePointerCancel?: (event: PointerEvent<HTMLButtonElement>) => void;
};

export default function Sheet({
    header,
    footer,
    showHandle = true,
    handleLabel = 'Sheet handle',
    onHandlePointerDown,
    onHandlePointerUp,
    onHandlePointerCancel,
    children,
    className,
    ...props
}: SheetProps) {
    return (
        <section
            role="region"
            className={cx(
                'flex max-h-[88svh] w-full flex-col rounded-t-sheet border border-border bg-surface shadow-sheet md:max-w-md md:rounded-panel md:shadow-panel',
                className
            )}
            {...props}
        >
            {showHandle ? (
                <button
                    type="button"
                    aria-label={handleLabel}
                    className="mx-auto mt-1 flex min-h-touch w-16 touch-none cursor-grab items-center justify-center rounded-control text-text-secondary active:cursor-grabbing focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    onPointerDown={onHandlePointerDown}
                    onPointerUp={onHandlePointerUp}
                    onPointerCancel={onHandlePointerCancel}
                >
                    <span aria-hidden="true" className="h-1 w-10 rounded-full bg-border" />
                </button>
            ) : null}
            {header ? <header className="border-b border-border px-4 py-3">{header}</header> : null}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
            {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
        </section>
    );
}
