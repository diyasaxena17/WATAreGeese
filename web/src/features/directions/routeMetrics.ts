import { Route, GraphLocation } from '../../routing/types';

export function getRouteSummaryLines(route: Route) {
    const end = route.graphLocations.at(-1) as GraphLocation;
    const time = Math.round(end.time / 60);

    return [
        `Time: ${time == 0 ? '<1' : time}min, Distance: ${Math.round(end.distance ?? 0).toLocaleString()}m`,
        `⬆️${end.floorsAscended} floors, ⬇️ ${end.floorsDescended} floors`
    ];
}

export function formatRouteDistance(distanceMeters: number | null | undefined) {
    if(distanceMeters == null) return null;
    const roundedMeters = Math.round(distanceMeters);
    if(roundedMeters >= 1000) return `${(roundedMeters / 1000).toFixed(roundedMeters >= 10000 ? 0 : 1)} km`;
    return `${roundedMeters.toLocaleString()} m`;
}

export function getRouteMetrics(route: Route | null) {
    if(!route) return [];
    const end = route.graphLocations.at(-1) as GraphLocation | undefined;
    if(!end) return [];

    const metrics = [];
    const distance = formatRouteDistance(end.distance);
    if(distance) metrics.push({ label: 'Distance', value: distance });

    const segmentCount = Math.max(route.graphLocations.length - 1, 0);
    metrics.push({ label: 'Segments', value: segmentCount.toLocaleString() });

    return metrics;
}
