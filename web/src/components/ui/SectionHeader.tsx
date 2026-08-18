import { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

export type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
};

export default function SectionHeader({
    title,
    description,
    action,
    className,
    ...props
}: SectionHeaderProps) {
    return (
        <div className={cx('flex items-start justify-between gap-3', className)} {...props}>
            <div className="min-w-0">
                <h2 className="wg-section-title">{title}</h2>
                {description ? <p className="wg-body-secondary mt-1">{description}</p> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
