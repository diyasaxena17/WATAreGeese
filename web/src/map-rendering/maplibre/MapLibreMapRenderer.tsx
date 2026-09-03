import 'maplibre-gl/dist/maplibre-gl.css';

import { EaseToOptions, FitBoundsOptions, GeoJSONSource, LngLatBounds, Map } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getBuildingOutlines, getCampusBuildingsGeoJson, getCampusPathsGeoJson } from '../../campus-data/selectors';
import { mapConfig } from '../../features/map/config/mapConfig';
import { UserPosition } from '../../features/location';
import { Location, Route } from '../../routing/types';
import { MapLocationSyncRequest, MapRenderer } from '../types';
import {
	CAMPUS_BUILDING_SOURCE_ID,
	CAMPUS_BUILDING_LABEL_SOURCE_ID,
	CAMPUS_PATH_SOURCE_ID,
	LOCATION_LABEL_SOURCE_ID,
	LOCATION_MARKER_SOURCE_ID,
	ROUTE_SOURCE_ID,
	SELECTED_BUILDING_SOURCE_ID,
	campusBuildingExtrusionLayer,
	campusBuildingLabelLayer,
	campusBuildingLabelSource,
	campusBuildingSource,
	locationMarkerLayers,
	campusPathLayers,
	campusPathLineOpacity,
	campusPathPointOpacity,
	campusPathSource,
	routeLayers,
	routeToGeoJson,
	selectedBuildingLayers,
	selectedLocationLabelLayer
} from './MapLibreMapLayers';
import { createSoftCampusMapStyle } from './mapStyle';

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
			style: createSoftCampusMapStyle(mapConfig.tileUrl, mapConfig.attribution),
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
			map.addSource(CAMPUS_BUILDING_SOURCE_ID, campusBuildingSource(getBuildingOutlines()));
			map.addLayer(campusBuildingExtrusionLayer);
			map.addSource(SELECTED_BUILDING_SOURCE_ID, {
				type: 'geojson',
				data: selectedBuildingToGeoJson(null)
			});
			selectedBuildingLayers.forEach(layer => map.addLayer(layer));
			map.addSource(CAMPUS_BUILDING_LABEL_SOURCE_ID, campusBuildingLabelSource(getCampusBuildingsGeoJson()));

			map.addSource(CAMPUS_PATH_SOURCE_ID, campusPathSource(getCampusPathsGeoJson()));
			campusPathLayers.forEach(layer => map.addLayer(layer));

			map.addSource(ROUTE_SOURCE_ID, {
				type: 'geojson',
				data: routeToGeoJson(null, null)
			});
			routeLayers.forEach(layer => map.addLayer(layer));
			map.addSource(LOCATION_LABEL_SOURCE_ID, {
				type: 'geojson',
				data: locationLabelsToGeoJson(null, null)
			});
			map.addSource(LOCATION_MARKER_SOURCE_ID, {
				type: 'geojson',
				data: locationMarkersToGeoJson(null, null, null)
			});
			locationMarkerLayers.forEach(layer => map.addLayer(layer));
			map.addLayer(campusBuildingLabelLayer);
			map.addLayer(selectedLocationLabelLayer);
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
		setPaintProperty(mapRef.current, 'campus-path-line-casing', 'line-opacity', hasRoute ? 0.35 : 0.68);
		setPaintProperty(mapRef.current, 'campus-path-lines', 'line-opacity', campusPathLineOpacity(hasRoute));
		setPaintProperty(mapRef.current, 'campus-path-points', 'circle-opacity', campusPathPointOpacity(hasRoute));
	}, [hasRoute]);

	useEffect(() => {
		updateLocationLabelSource(mapRef.current, startMarkerLocation, endMarkerLocation);
		updateLocationMarkerSource(mapRef.current, startMarkerLocation, endMarkerLocation, userPosition);
	}, [startMarkerLocation, endMarkerLocation, userPosition]);

	return useMemo(() => ({
		mapElement: <div ref={containerRef} className="h-full w-full" />,
		isReady,
		canRenderDirections: true,
		syncStartLocation: resolveLocation,
		syncEndLocation: resolveLocation,
		focusLocation: location => {
			flyToSelectedBuilding(mapRef.current, location);
		},
		setLocationMarkers: (start, end) => {
			setStartMarkerLocation(start);
			setEndMarkerLocation(end);
		},
		displayRoute: route => {
			setDisplayedRoute(route);
			fitRouteBounds(mapRef.current, route);
			return () => setDisplayedRoute(null);
		},
		recenterUserLocation: position => {
			const target = position ?? userPosition;
			if(!target) return;

			mapRef.current?.easeTo(userLocationCameraOptions(target));
		}
	}), [isReady, userPosition]);
}

function flyToSelectedBuilding(map: Map | null, location: Location | null) {
	if(!map || !location) return;

	updateSelectedBuildingSource(map, location);
	map.easeTo(selectedBuildingCameraOptions(location));
}

function fitRouteBounds(map: Map | null, route: Route | null) {
	const coordinates = route?.graphLocations.flatMap(graphLocation => graphLocation.path) ?? [];
	if(!map || coordinates.length == 0) return;

	const bounds = coordinates.reduce(
		(currentBounds, coordinate) => currentBounds.extend(coordinate),
		new LngLatBounds(coordinates[0], coordinates[0])
	);

	map.fitBounds(bounds, routeBoundsCameraOptions());
}

export function selectedBuildingCameraOptions(location: Location): EaseToOptions {
	return {
		center: location.coordinate.toArray(),
		zoom: mapConfig.maplibre.camera.selectedBuildingZoom,
		pitch: mapConfig.maplibre.camera.defaultPitch,
		bearing: mapConfig.maplibre.camera.defaultBearing,
		duration: motionDuration()
	};
}

export function routeBoundsCameraOptions(): FitBoundsOptions {
	return {
		padding: mapConfig.maplibre.camera.routeBoundsPadding,
		maxZoom: mapConfig.maplibre.camera.routeZoom,
		pitch: mapConfig.maplibre.camera.defaultPitch,
		bearing: mapConfig.maplibre.camera.defaultBearing,
		duration: motionDuration()
	};
}

export function userLocationCameraOptions(position: UserPosition): EaseToOptions {
	return {
		center: [position.coordinates.longitude, position.coordinates.latitude],
		zoom: mapConfig.maplibre.camera.userLocationZoom,
		pitch: mapConfig.maplibre.camera.defaultPitch,
		duration: motionDuration()
	};
}

export function motionDuration() {
	if(typeof window == 'undefined') return mapConfig.maplibre.camera.animationDurationMs;
	if(!window.matchMedia) return mapConfig.maplibre.camera.animationDurationMs;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : mapConfig.maplibre.camera.animationDurationMs;
}

function updateRouteSource(map: Map | null, route: Route | null, highlightedDirection: number | null) {
	const source = map?.getSource(ROUTE_SOURCE_ID);
	if(!source) return;

	(source as GeoJSONSource).setData(routeToGeoJson(route, highlightedDirection));
}

function updateLocationLabelSource(map: Map | null, start: Location | null, end: Location | null) {
	const source = map?.getSource(LOCATION_LABEL_SOURCE_ID);
	if(!source) return;

	(source as GeoJSONSource).setData(locationLabelsToGeoJson(start, end));
}

function updateLocationMarkerSource(map: Map | null, start: Location | null, end: Location | null, userPosition: UserPosition | null) {
	const source = map?.getSource(LOCATION_MARKER_SOURCE_ID);
	if(!source) return;

	(source as GeoJSONSource).setData(locationMarkersToGeoJson(start, end, userPosition));
}

function updateSelectedBuildingSource(map: Map | null, location: Location | null) {
	const source = map?.getSource(SELECTED_BUILDING_SOURCE_ID);
	if(!source) return;

	(source as GeoJSONSource).setData(selectedBuildingToGeoJson(location));
}

function setPaintProperty(map: Map | null, layerId: string, property: string, value: unknown) {
	if(!map?.getLayer(layerId)) return;

	map.setPaintProperty(layerId, property, value);
}

function locationLabelsToGeoJson(start: Location | null, end: Location | null) {
	return {
		type: 'FeatureCollection' as const,
		features: [
			locationLabelFeature(start),
			locationLabelFeature(end)
		].filter(feature => feature != null)
	};
}

function locationLabelFeature(location: Location | null) {
	if(!location) return null;

	return {
		type: 'Feature' as const,
		properties: {
			label: location.buildingFloor.buildingCode
		},
		geometry: {
			type: 'Point' as const,
			coordinates: location.coordinate.toArray()
		}
	};
}

export function locationMarkersToGeoJson(start: Location | null, end: Location | null, userPosition: UserPosition | null) {
	return {
		type: 'FeatureCollection' as const,
		features: [
			locationMarkerFeature('start', start?.coordinate.toArray() ?? null, 'S'),
			locationMarkerFeature('end', end?.coordinate.toArray() ?? null, 'D'),
			locationMarkerFeature(
				'user',
				userPosition ? [userPosition.coordinates.longitude, userPosition.coordinates.latitude] : null,
				'',
				userPosition?.accuracyMeters
			)
		].filter(feature => feature != null)
	};
}

function locationMarkerFeature(kind: 'start' | 'end' | 'user', coordinates: [number, number] | null, glyph: string, accuracyMeters?: number) {
	if(!coordinates) return null;

	return {
		type: 'Feature' as const,
		properties: {
			kind,
			glyph,
			...(accuracyMeters != null ? { accuracyMeters } : {})
		},
		geometry: {
			type: 'Point' as const,
			coordinates
		}
	};
}

export function selectedBuildingToGeoJson(location: Location | null) {
	const buildingCode = location?.buildingFloor.buildingCode;

	return {
		type: 'FeatureCollection' as const,
		features: buildingCode ? getBuildingOutlines().filter(feature =>
			feature.properties.default.buildingCode == buildingCode
		) : []
	};
}
