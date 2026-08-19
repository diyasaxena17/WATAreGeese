import { Location, Route } from '../../routing/types';

export type RouteMode = 'avoid-outside' | 'shortest';

export type RouteRequest = {
    start: Location;
    end: Location;
    mode?: RouteMode;
};

export type RouteResult = {
    route: Route | null;
};
