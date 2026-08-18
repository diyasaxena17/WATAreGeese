import { Route, GraphLocation } from '../../routing/types';

export type RouteSummaryProps = {
    route: Route;
};

export function getRouteSummaryLines(route: Route) {
    const end = route.graphLocations.at(-1) as GraphLocation;
    const time = Math.round(end.time / 60);

    return [
        `Time: ${time == 0 ? '<1' : time}min, Distance: ${Math.round(end.distance ?? 0).toLocaleString()}m`,
        `⬆️${end.floorsAscended} floors, ⬇️ ${end.floorsDescended} floors`
    ];
}

export default function RouteSummary({ route }: RouteSummaryProps) {
    return (
        <div className="pb-2">
            {getRouteSummaryLines(route).map(line => (
                <div key={line}>{line}</div>
            ))}
        </div>
    );
}
