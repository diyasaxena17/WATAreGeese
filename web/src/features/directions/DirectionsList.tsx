import { Route } from '../../routing/types';
import DirectionsListItem from './DirectionsListItem';

export type DirectionsListProps = {
    route: Route;
    selectedDirection: number | null;
    onHighlightDirection: (order: number) => void;
    onClearHighlight: () => void;
    onSelectDirection: (order: number) => void;
};

export default function DirectionsList({
    route,
    selectedDirection,
    onHighlightDirection,
    onClearHighlight,
    onSelectDirection
}: DirectionsListProps) {
    return (
        <div className="space-y-1">
            {route.graphLocations.slice(1).map((graphLocation, idx) => (
                <DirectionsListItem
                    key={`${graphLocation.location.toString()}-${idx}`}
                    graphLocation={graphLocation}
                    order={idx + 1}
                    isSelected={selectedDirection == idx + 1}
                    onHighlight={onHighlightDirection}
                    onClearHighlight={onClearHighlight}
                    onSelect={onSelectDirection}
                />
            ))}
        </div>
    );
}
