import { ComponentProps } from 'react';
import IconButton from './IconButton';
import { cx } from './utils';

export type MapControlButtonProps = ComponentProps<typeof IconButton>;

export default function MapControlButton({ className, ...props }: MapControlButtonProps) {
    return (
        <IconButton
            className={cx('bg-surface shadow-panel', className)}
            {...props}
        />
    );
}
