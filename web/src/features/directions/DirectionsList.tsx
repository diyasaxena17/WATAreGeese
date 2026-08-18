import { Route } from '../../routing/types';
import DirectionsListItem from './DirectionsListItem';
import { DirectionStepRenderer } from './types';

export type DirectionsListProps = {
    route: Route;
    renderDirectionItem: DirectionStepRenderer;
};

export default function DirectionsList({ route, renderDirectionItem }: DirectionsListProps) {
    return (
        <>
            {route.graphLocations.slice(1).map((graphLocation, idx) => (
                <DirectionsListItem
                    key={`${graphLocation.location.toString()}-${idx}`}
                    graphLocation={graphLocation}
                    order={idx + 1}
                    onlyHighlightOnHover
                    renderDirectionItem={renderDirectionItem}
                />
            ))}
        </>
    );
}
