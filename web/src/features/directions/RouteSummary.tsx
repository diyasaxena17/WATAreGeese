import { Route } from '../../routing/types';
import Button from '../../components/ui/Button';
import RouteMetric from '../../components/ui/RouteMetric';
import { getRouteMetrics } from './routeMetrics';
import { RouteEndpointSummary } from './types';

export type RouteSummaryProps = {
    route: Route | null;
    from?: RouteEndpointSummary | null;
    to?: RouteEndpointSummary | null;
    onChangeRoute?: () => void;
};

export default function RouteSummary({ route, from, to, onChangeRoute }: RouteSummaryProps) {
    if(!route) {
        return (
            <div className="space-y-3">
                <div>
                    <div className="text-wg-section-title">No route found</div>
                    <p className="text-wg-body-secondary">Try changing the start or destination.</p>
                </div>
                {onChangeRoute ? (
                    <Button variant="secondary" className="w-full" onClick={onChangeRoute}>
                        Change route
                    </Button>
                ) : null}
            </div>
        );
    }

    const metrics = getRouteMetrics(route);

    return (
        <div className="space-y-3">
            <div className="min-w-0">
                <div className="truncate text-wg-section-title">
                    {from?.code ?? 'Start'} → {to?.code ?? 'Destination'}
                </div>
                {(from?.name || to?.name) ? (
                    <div className="mt-1 text-wg-body-secondary">
                        {from?.name ? <div className="truncate">{from.name}</div> : null}
                        <div>to</div>
                        {to?.name ? <div className="truncate">{to.name}</div> : null}
                    </div>
                ) : null}
            </div>

            {metrics.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                    {metrics.map(metric => (
                        <RouteMetric
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                        />
                    ))}
                </div>
            ) : null}

            {onChangeRoute ? (
                <Button variant="secondary" className="w-full" onClick={onChangeRoute}>
                    Change route
                </Button>
            ) : null}
        </div>
    );
}
