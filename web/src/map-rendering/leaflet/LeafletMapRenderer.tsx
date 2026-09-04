/* eslint-disable react-refresh/only-export-components */
import 'leaflet/dist/leaflet.css';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import { mapConfig } from '../../features/map/config/mapConfig';
import { UserPosition } from '../../features/location';
import { Location, Route } from '../../routing/types';
import { MapLocationSyncRequest, MapRenderer, RouteStepSelectHandler } from '../types';
import {
	CampusLayers,
	LocationMarkers,
	RouteLayers
} from './LeafletMapLayers';
import LeafletZoomControl from './LeafletZoomControl';
import UserLocationMarker from './UserLocationMarker';
import UserLocationViewport from './UserLocationViewport';

type LeafletMapRendererHostProps = {
	hasRoute: boolean;
	highlightedDirection: number | null;
	userPosition: UserPosition | null;
	onSelectRouteStep?: RouteStepSelectHandler;
	onRendererChange: (renderer: MapRenderer | null) => void;
};

export function LeafletMapRendererHost({
	hasRoute,
	highlightedDirection,
	userPosition,
	onSelectRouteStep,
	onRendererChange
}: LeafletMapRendererHostProps) {
	const renderer = useLeafletMapRenderer(hasRoute, highlightedDirection, userPosition, onSelectRouteStep);

	useEffect(() => {
		onRendererChange(renderer);
		return () => onRendererChange(null);
	}, [onRendererChange, renderer]);

	return renderer.mapElement;
}

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
	userPosition: UserPosition | null = null,
	onSelectRouteStep?: RouteStepSelectHandler
): MapRenderer {
	const [displayedRoute, setDisplayedRoute] = useState<Route | null>(null);
	const [startMarkerLocation, setStartMarkerLocation] = useState<Location | null>(null);
	const [endMarkerLocation, setEndMarkerLocation] = useState<Location | null>(null);
	const [recenterTarget, setRecenterTarget] = useState<UserPosition | null>(null);

	return useMemo(() => ({
		mapElement: (
			<MapContainer
				center={mapConfig.center}
				zoom={mapConfig.defaultZoom}
				minZoom={mapConfig.minZoom}
				maxBounds={mapConfig.maxBounds}
				className="wg-hat-map h-full w-full"
				zoomControl={false}
			>
				<TileLayer
					url={mapConfig.tileUrl}
					attribution={mapConfig.attribution}
				/>
				<LeafletZoomControl />
				<CampusLayers dimmed={hasRoute} />
				<RouteLayers
					route={displayedRoute}
					highlightedDirection={highlightedDirection}
					onSelectRouteStep={onSelectRouteStep}
				/>
				<LocationMarkers start={startMarkerLocation} end={endMarkerLocation} />
				<UserLocationMarker position={userPosition} />
				<UserLocationViewport target={recenterTarget} />
			</MapContainer>
		),
		isReady: true,
		canRenderDirections: true,
		syncStartLocation: resolveLocation,
		syncEndLocation: resolveLocation,
		focusLocation: () => {},
		setLocationMarkers: (start, end) => {
			setStartMarkerLocation(start);
			setEndMarkerLocation(end);
		},
		displayRoute: route => {
			setDisplayedRoute(route);
			return () => setDisplayedRoute(null);
		},
		recenterUserLocation: position => {
			setRecenterTarget(position ?? userPosition);
		}
	}), [displayedRoute, endMarkerLocation, hasRoute, highlightedDirection, onSelectRouteStep, recenterTarget, startMarkerLocation, userPosition]);
}
