import 'leaflet/dist/leaflet.css';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import { mapConfig } from '../../features/map/config/mapConfig';
import { UserPosition } from '../../features/location';
import { Location, Route } from '../../routing/types';
import { MapLocationSyncRequest, MapRenderer } from '../types';
import {
	CampusLayers,
	LocationMarkers,
	RouteLayers
} from './LeafletMapLayers';
import UserLocationMarker from './UserLocationMarker';

function resolveLocation(request: MapLocationSyncRequest): Location | null {
	if(request.route) {
		request.clearRoute();
		request.setClearRoute(() => () => {});
		request.setRoute(null);
		request.setHasRoute(false);
	}

	if(!request.building || !request.floor) return null;
	return request.startEndLocations.get(`${request.building.value}|${request.floor.value}`) ?? null;
}

export function useLeafletMapRenderer(
	hasRoute = false,
	highlightedDirection: number | null = null,
	userPosition: UserPosition | null = null
): MapRenderer {
	const [displayedRoute, setDisplayedRoute] = useState<Route | null>(null);
	const [startMarkerLocation, setStartMarkerLocation] = useState<Location | null>(null);
	const [endMarkerLocation, setEndMarkerLocation] = useState<Location | null>(null);

	return useMemo(() => ({
		mapElement: (
			<MapContainer
				center={mapConfig.center}
				zoom={mapConfig.defaultZoom}
				minZoom={mapConfig.minZoom}
				maxBounds={mapConfig.maxBounds}
				className="h-full w-full"
				zoomControl
			>
				<TileLayer
					url={mapConfig.tileUrl}
					attribution={mapConfig.attribution}
				/>
				<CampusLayers dimmed={hasRoute} />
				<RouteLayers route={displayedRoute} highlightedDirection={highlightedDirection} />
				<LocationMarkers start={startMarkerLocation} end={endMarkerLocation} />
				<UserLocationMarker position={userPosition} />
			</MapContainer>
		),
		isReady: true,
		canRenderDirections: true,
		syncStartLocation: resolveLocation,
		syncEndLocation: resolveLocation,
		setLocationMarkers: (start, end) => {
			setStartMarkerLocation(start);
			setEndMarkerLocation(end);
		},
		displayRoute: route => {
			setDisplayedRoute(route);
			return () => setDisplayedRoute(null);
		}
	}), [displayedRoute, endMarkerLocation, hasRoute, highlightedDirection, startMarkerLocation, userPosition]);
}
