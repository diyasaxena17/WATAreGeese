import { HTMLAttributes } from 'react';
import { cx } from './utils';

export type DividerProps = HTMLAttributes<HTMLHRElement>;

export default function Divider({ className, ...props }: DividerProps) {
    return <hr className={cx('my-3 border-0 border-t border-border', className)} {...props} />;
}
