import 'maplibre-gl/dist/maplibre-gl.css';

import { GeoJSONSource, Map } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getCampusPathsGeoJson } from '../../campus-data/selectors';
import { mapConfig } from '../../features/map/config/mapConfig';
import { UserPosition } from '../../features/location';
import { Location, Route } from '../../routing/types';
import { MapLocationSyncRequest, MapRenderer } from '../types';
import {
	CAMPUS_PATH_SOURCE_ID,
	ROUTE_SOURCE_ID,
	campusPathLayers,
	campusPathSource,
	createCampusMapStyle,
	routeLayers,
	routeToGeoJson
} from './MapLibreMapLayers';

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

export function useMapLibreMapRenderer(
	hasRoute = false,
	highlightedDirection: number | null = null,
	userPosition: UserPosition | null = null
): MapRenderer {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<Map | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [displayedRoute, setDisplayedRoute] = useState<Route | null>(null);
	const [startMarkerLocation, setStartMarkerLocation] = useState<Location | null>(null);
	const [endMarkerLocation, setEndMarkerLocation] = useState<Location | null>(null);

	useEffect(() => {
		if(!containerRef.current || mapRef.current) return;

		const map = new Map({
			container: containerRef.current,
			style: createCampusMapStyle(mapConfig.tileUrl, mapConfig.attribution),
			center: [mapConfig.center[1], mapConfig.center[0]],
			zoom: mapConfig.maplibre.camera.defaultZoom,
			pitch: mapConfig.maplibre.camera.defaultPitch,
			bearing: mapConfig.maplibre.camera.defaultBearing,
			maxPitch: mapConfig.maplibre.camera.maxPitch,
			minZoom: mapConfig.minZoom,
			maxBounds: [
				[mapConfig.maxBounds[0][1], mapConfig.maxBounds[0][0]],
				[mapConfig.maxBounds[1][1], mapConfig.maxBounds[1][0]]
			]
		});

		mapRef.current = map;

		map.on('load', () => {
			map.addSource(CAMPUS_PATH_SOURCE_ID, campusPathSource(getCampusPathsGeoJson()));
			campusPathLayers.forEach(layer => map.addLayer(layer));

			map.addSource(ROUTE_SOURCE_ID, {
				type: 'geojson',
				data: routeToGeoJson(null, null)
			});
			routeLayers.forEach(layer => map.addLayer(layer));
			setIsReady(true);
		});

		return () => {
			map.remove();
			mapRef.current = null;
			setIsReady(false);
		};
	}, []);

	useEffect(() => {
		updateRouteSource(mapRef.current, displayedRoute, highlightedDirection);
	}, [displayedRoute, highlightedDirection]);

	useEffect(() => {
		const opacity = hasRoute ? 0.25 : 0.6;
		setPaintProperty(mapRef.current, 'campus-path-lines', 'line-opacity', opacity);
		setPaintProperty(mapRef.current, 'campus-path-points', 'circle-opacity', opacity);
	}, [hasRoute]);

	useEffect(() => {
		updatePointSource(mapRef.current, 'start-location', startMarkerLocation?.coordinate.toArray() ?? null, '#ffffff', '#2563eb');
		updatePointSource(mapRef.current, 'end-location', endMarkerLocation?.coordinate.toArray() ?? null, '#2563eb', '#2563eb');
	}, [startMarkerLocation, endMarkerLocation]);

	useEffect(() => {
		updatePointSource(mapRef.current, 'user-location', userPosition ? [userPosition.longitude, userPosition.latitude] : null, '#2563eb', '#ffffff');
	}, [userPosition]);

	return useMemo(() => ({
		mapElement: <div ref={containerRef} className="h-full w-full" />,
		isReady,
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
		},
		recenterUserLocation: position => {
			const target = position ?? userPosition;
			if(!target) return;

			mapRef.current?.easeTo({
				center: [target.longitude, target.latitude],
				zoom: mapConfig.maplibre.camera.userLocationZoom,
				pitch: mapConfig.maplibre.camera.defaultPitch,
				bearing: mapConfig.maplibre.camera.defaultBearing,
				duration: mapConfig.maplibre.camera.animationDurationMs
			});
		}
	}), [isReady, userPosition]);
}

function updateRouteSource(map: Map | null, route: Route | null, highlightedDirection: number | null) {
	const source = map?.getSource(ROUTE_SOURCE_ID);
	if(!source) return;

	(source as GeoJSONSource).setData(routeToGeoJson(route, highlightedDirection));
}

function setPaintProperty(map: Map | null, layerId: string, property: string, value: number) {
	if(!map?.getLayer(layerId)) return;

	map.setPaintProperty(layerId, property, value);
}

function updatePointSource(
	map: Map | null,
	id: string,
	coordinates: [number, number] | null,
	fillColor: string,
	strokeColor: string
) {
	if(!map || !map.isStyleLoaded()) return;

	const data = {
		type: 'FeatureCollection' as const,
		features: coordinates ? [{
			type: 'Feature' as const,
			properties: {},
			geometry: {
				type: 'Point' as const,
				coordinates
			}
		}] : []
	};

	const existingSource = map.getSource(id);
	if(existingSource) {
		(existingSource as GeoJSONSource).setData(data);
		return;
	}

	map.addSource(id, { type: 'geojson', data });
	map.addLayer({
		id,
		type: 'circle',
		source: id,
		paint: {
			'circle-color': fillColor,
			'circle-radius': 7,
			'circle-stroke-color': strokeColor,
			'circle-stroke-width': 2
		}
	});
}
