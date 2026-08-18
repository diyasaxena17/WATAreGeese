import { Route } from '../../routing/types';
import DirectionsList from './DirectionsList';
import RouteSummary from './RouteSummary';
import { RouteEndpointSummary } from './types';

export type DirectionsPanelProps = {
    route: Route | null;
    variant: 'mobile' | 'desktop';
    onChangeRoute?: () => void;
    from?: RouteEndpointSummary | null;
    to?: RouteEndpointSummary | null;
    selectedDirection: number | null;
    onHighlightDirection: (order: number) => void;
    onClearHighlight: () => void;
    onSelectDirection: (order: number) => void;
};

export default function DirectionsPanel({
    route,
    variant,
    onChangeRoute,
    from,
    to,
    selectedDirection,
    onHighlightDirection,
    onClearHighlight,
    onSelectDirection
}: DirectionsPanelProps) {
    return (
        <div
            id={variant == 'mobile' ? 'mobile-directions' : 'directions'}
            className={variant == 'mobile'
                ? 'visible md:invisible'
                : 'invisible md:visible'
            }
        >
            <div className="space-y-4">
                {route != null ? (
                    <>
                    <RouteSummary route={route} from={from} to={to} onChangeRoute={onChangeRoute} />
                        <section aria-label="Directions" className="space-y-2">
                            <h2 className="text-wg-section-title">Directions</h2>
                            <DirectionsList
                                route={route}
                                selectedDirection={selectedDirection}
                                onHighlightDirection={onHighlightDirection}
                                onClearHighlight={onClearHighlight}
                                onSelectDirection={onSelectDirection}
                            />
                        </section>
                    </>
                ) : <RouteSummary route={null} onChangeRoute={onChangeRoute} />}
            </div>
        </div>
    );
}
