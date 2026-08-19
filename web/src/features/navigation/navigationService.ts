import { getRoutingGeoJson } from '../../campus-data/selectors';
import { Dijkstra } from '../../routing/dijkstra';
import { AdjacencyList } from '../../routing/graph';
import { RouteRequest, RouteResult } from './types';

export class NavigationService {
    private readonly router: Dijkstra;

    constructor(router = new Dijkstra(new AdjacencyList(getRoutingGeoJson()))) {
        this.router = router;
    }

    calculateRoute(request: RouteRequest): RouteResult {
        const mode = request.mode ?? 'avoid-outside';
        if(mode != 'avoid-outside' && mode != 'shortest') throw new Error(`Unsupported route mode: ${mode}`);
        const comparatorKey = mode == 'avoid-outside'
            ? 'COMPARE_BY_TIME_OUTSIDE_THEN_TIME'
            : 'COMPARE_BY_TIME';

        return {
            route: this.router.calculateRoute(
                request.start,
                request.end,
                Dijkstra.COMPARATORS.get(comparatorKey)
            )
        };
    }
}
