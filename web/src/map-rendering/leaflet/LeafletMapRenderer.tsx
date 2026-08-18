import 'leaflet/dist/leaflet.css';

import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

import { mapConfig } from '../../features/map/config/mapConfig';
import { Location } from '../../routing/types';
import { MapLocationSyncRequest, MapRenderer } from '../types';

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

export function useLeafletMapRenderer(): MapRenderer {
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
			</MapContainer>
		),
		isReady: true,
		canRenderDirections: false,
		syncStartLocation: resolveLocation,
		syncEndLocation: resolveLocation,
		displayRoute: () => () => {},
		renderDirectionItem: () => null
	}), []);
}
