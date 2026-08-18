import { GraphLocation } from '../../routing/types';
import { DirectionStepRenderer } from './types';

export type DirectionsListItemProps = {
    graphLocation: GraphLocation;
    order: number;
    onlyHighlightOnHover: boolean;
    renderDirectionItem: DirectionStepRenderer;
};

export default function DirectionsListItem({
    graphLocation,
    order,
    onlyHighlightOnHover,
    renderDirectionItem
}: DirectionsListItemProps) {
    return renderDirectionItem({ graphLocation, order, onlyHighlightOnHover });
}
