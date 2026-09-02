import { useEffect, useRef } from 'react';

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
    onClearHighlight,
    onSelectDirection
}: DirectionsPanelProps) {
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if(selectedDirection == null) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target;
            if(!(target instanceof Element)) return;
            if(target.closest('[data-direction-step]')) return;

            onClearHighlight();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [onClearHighlight, selectedDirection]);

    return (
        <div
            ref={panelRef}
            id={variant == 'mobile' ? 'mobile-directions' : 'directions'}
            className={variant == 'mobile'
                ? 'block lg:hidden'
                : 'hidden lg:block'
            }
        >
            <div className="space-y-4">
                {route != null ? (
                    <>
                        <RouteSummary route={route} from={from} to={to} onChangeRoute={onChangeRoute} />
                        <section aria-label="Directions" className="space-y-2">
                            <h2 className="text-wg-section-title">Directions</h2>
                            <div className="max-h-[min(52svh,32rem)] overflow-y-auto pr-1">
                                <DirectionsList
                                    route={route}
                                    selectedDirection={selectedDirection}
                                    onClearHighlight={onClearHighlight}
                                    onSelectDirection={onSelectDirection}
                                />
                            </div>
                        </section>
                    </>
                ) : <RouteSummary route={null} onChangeRoute={onChangeRoute} />}
            </div>
        </div>
    );
}
