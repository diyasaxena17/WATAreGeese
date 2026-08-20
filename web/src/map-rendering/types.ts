import { Dispatch, ReactNode, SetStateAction } from 'react';

import { UserPosition } from '../features/location';
import { Route, Location } from '../routing/types';
import { OptionType } from '../map/locations';

export type RouteDisplayCleanup = () => void;

export type MapLocationSyncRequest = {
	building: OptionType | null;
	floor: OptionType | null;
	startEndLocations: Map<string, Location>;
	route: Route | null;
	clearRoute: RouteDisplayCleanup;
	setClearRoute: Dispatch<SetStateAction<RouteDisplayCleanup>>;
	setRoute: Dispatch<SetStateAction<Route | null>>;
	setHasRoute: Dispatch<SetStateAction<boolean>>;
};

export type MapRenderer = {
	mapElement: ReactNode;
	isReady: boolean;
	canRenderDirections: boolean;
	syncStartLocation: (request: MapLocationSyncRequest) => Location | null;
	syncEndLocation: (request: MapLocationSyncRequest) => Location | null;
	setLocationMarkers: (start: Location | null, end: Location | null) => void;
	displayRoute: (route: Route | null) => RouteDisplayCleanup;
	recenterUserLocation: (position?: UserPosition | null) => void;
};
