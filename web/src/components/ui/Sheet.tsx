import { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export type SheetProps = HTMLAttributes<HTMLElement> & {
    header?: ReactNode;
    footer?: ReactNode;
    showHandle?: boolean;
};

export default function Sheet({
    header,
    footer,
    showHandle = true,
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
            {showHandle ? <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" /> : null}
            {header ? <header className="border-b border-border px-4 py-3">{header}</header> : null}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
            {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
        </section>
    );
}
