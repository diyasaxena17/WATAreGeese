import { HTMLAttributes } from 'react';
import { cx } from './utils';

export type PanelProps = HTMLAttributes<HTMLElement>;

export default function Panel({ className, ...props }: PanelProps) {
    return (
        <section
            className={cx('rounded-panel border border-border bg-surface p-4 shadow-panel', className)}
            {...props}
        />
    );
}
