import { forwardRef, InputHTMLAttributes } from 'react';
import { cx } from './utils';

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({
    label,
    value,
    onChange,
    onClear,
    className,
    id,
    ...props
}, ref) {
    const inputId = id ?? 'wg-search-input';

    return (
        <div className={cx('w-full', className)}>
            <label htmlFor={inputId} className="sr-only">{label}</label>
            <div className="wg-control flex items-center gap-2 px-3">
                <span aria-hidden="true" className="text-text-secondary">⌕</span>
                <input
                    ref={ref}
                    id={inputId}
                    type="search"
                    value={value}
                    onChange={event => onChange(event.target.value)}
                    className="min-h-0 flex-1 bg-transparent py-2 text-wg-body text-text-primary outline-none placeholder:text-text-secondary"
                    {...props}
                />
                {value.length > 0 ? (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            onChange('');
                            onClear?.();
                        }}
                        className="inline-flex size-8 min-h-0 items-center justify-center rounded-control text-text-secondary transition hover:bg-background hover:text-text-primary focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                ) : null}
            </div>
        </div>
    );
});

export default SearchInput;
