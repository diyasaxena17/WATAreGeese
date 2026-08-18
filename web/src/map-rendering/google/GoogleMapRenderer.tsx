import { useMemo, useState } from 'react';

import DirectionsListItem from '../../components/DirectionsListItem';
import useBaseGeoJson from '../../hooks/useBaseGeoJson';
import useGoogleMapsLibrary from '../../hooks/useGoogleMapsLibrary';
import displayRoute from '../../map/displayRoute';
import updateLocation from '../../map/updateLocation';
import useLoadMap from '../../map/loadMap';
import { MapLocationSyncRequest, MapRenderer } from '../types';

export function useGoogleMapRenderer(hasRoute: boolean): MapRenderer {
	const { googleMap } = useLoadMap();
	const { library: Markers } = useGoogleMapsLibrary("marker");
	const [startLocationMarker, setStartLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
	const [endLocationMarker, setEndLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

	useBaseGeoJson(googleMap, hasRoute);

	const endMarkerContent = useMemo(() => Markers ? new Markers.PinElement({
		background: '#009933',
		borderColor: '#196619',
		glyphColor: '#196619'
	}).element : undefined, [Markers]);

	return useMemo(() => ({
		mapElement: <div id="map" className="h-full w-full" />,
		isReady: Boolean(googleMap),
		canRenderDirections: Boolean(googleMap && Markers),
		syncStartLocation: (request: MapLocationSyncRequest) => updateLocation(
			request.building,
			request.floor,
			request.startEndLocations,
			startLocationMarker,
			setStartLocationMarker,
			request.route,
			request.setRoute,
			request.clearRoute,
			request.setClearRoute,
			request.setHasRoute,
			googleMap,
			Markers
		)(),
		syncEndLocation: (request: MapLocationSyncRequest) => updateLocation(
			request.building,
			request.floor,
			request.startEndLocations,
			endLocationMarker,
			setEndLocationMarker,
			request.route,
			request.setRoute,
			request.clearRoute,
			request.setClearRoute,
			request.setHasRoute,
			googleMap,
			Markers,
			endMarkerContent
		)(),
		setLocationMarkers: () => {},
		displayRoute: route => displayRoute(googleMap, route),
		renderDirectionItem: request => googleMap && Markers ? (
			<DirectionsListItem
				googleMap={googleMap}
				graphLocation={request.graphLocation}
				order={request.order}
				onlyHighlightOnHover={request.onlyHighlightOnHover}
				Markers={Markers}
			/>
		) : null
	}), [Markers, endMarkerContent, endLocationMarker, googleMap, startLocationMarker]);
}
