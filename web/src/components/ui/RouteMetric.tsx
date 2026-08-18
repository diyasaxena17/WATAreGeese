import { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export type RouteMetricProps = HTMLAttributes<HTMLDivElement> & {
    label: ReactNode;
    value: ReactNode;
};

export default function RouteMetric({ label, value, className, ...props }: RouteMetricProps) {
    return (
        <div className={cx('min-w-0 rounded-control border border-border bg-surface-raised px-3 py-2', className)} {...props}>
            <div className="truncate text-wg-building-code">{value}</div>
            <div className="truncate text-wg-label">{label}</div>
        </div>
    );
}
