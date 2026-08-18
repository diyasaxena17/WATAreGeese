import { GraphLocation } from '../../routing/types';
import { toDirectionsString } from '../../routing/directions';
import { cx } from '../../components/ui/utils';

export type DirectionsListItemProps = {
    graphLocation: GraphLocation;
    order: number;
    isSelected?: boolean;
    onHighlight?: (order: number) => void;
    onClearHighlight?: () => void;
    onSelect?: (order: number) => void;
};

export default function DirectionsListItem({
    graphLocation,
    order,
    isSelected,
    onHighlight,
    onClearHighlight,
    onSelect
}: DirectionsListItemProps) {
    const instruction = toDirectionsString(graphLocation);
    const travelMode = graphLocation.travelMode;

    return (
        <button
            type="button"
            className={cx(
                'grid w-full grid-cols-[2rem_1fr] gap-2 rounded-control px-2 py-2 text-left transition',
                'hover:bg-surface-raised focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                isSelected && 'bg-accent/20'
            )}
            aria-current={isSelected ? 'step' : undefined}
            onMouseEnter={() => onHighlight?.(order)}
            onMouseLeave={onClearHighlight}
            onFocus={() => onHighlight?.(order)}
            onBlur={onClearHighlight}
            onClick={() => onSelect?.(order)}
        >
            <span className="flex size-7 items-center justify-center rounded-full border border-border bg-surface text-wg-label text-text-secondary">
                {order}
            </span>
            <span className="min-w-0">
                <span className="block text-wg-body text-text-primary">{instruction}</span>
                {travelMode ? (
                    <span className="mt-1 block text-wg-label capitalize text-text-secondary">
                        {travelMode}
                    </span>
                ) : null}
            </span>
        </button>
    );
}
