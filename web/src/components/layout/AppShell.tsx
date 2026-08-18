import { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../ui/utils';

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
    map: ReactNode;
    panel?: ReactNode;
    sheet?: ReactNode;
    mapControls?: ReactNode;
    children?: ReactNode;
};

export default function AppShell({
    map,
    panel,
    sheet,
    mapControls,
    children,
    className,
    ...props
}: AppShellProps) {
    return (
        <div
            className={cx(
                'relative grid min-h-svh overflow-hidden bg-background text-text-primary',
                'grid-cols-1 lg:grid-cols-[minmax(320px,400px)_1fr]',
                className
            )}
            {...props}
        >
            {panel ? (
                <aside
                    className={cx(
                        'z-20 hidden min-h-0 border-r border-border bg-surface lg:flex lg:flex-col',
                        'lg:max-h-svh lg:overflow-y-auto'
                    )}
                >
                    {panel}
                </aside>
            ) : null}

            <main className="relative min-h-svh min-w-0 overflow-hidden">
                <div className="absolute inset-0">{map}</div>

                {mapControls ? (
                    <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 sm:right-4 sm:top-4 lg:right-5 lg:top-5">
                        {mapControls}
                    </div>
                ) : null}

                {sheet ? (
                    <div className="absolute inset-x-0 bottom-0 z-30 max-h-[88svh] px-2 pb-2 sm:px-4 sm:pb-4 lg:hidden">
                        {sheet}
                    </div>
                ) : null}

                {children}
            </main>
        </div>
    );
}
