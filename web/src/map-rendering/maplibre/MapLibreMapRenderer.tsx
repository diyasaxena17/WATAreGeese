/* eslint-disable react-refresh/only-export-components */
import 'maplibre-gl/dist/maplibre-gl.css';

import { EaseToOptions, FitBoundsOptions, GeoJSONSource, LngLatBounds, Map, MapLayerMouseEvent } from 'maplibre-gl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getBuildingOutlines, getCampusBuildingsGeoJson, getCampusPathsGeoJson } from '../../campus-data/selectors';
import { mapConfig } from '../../features/map/config/mapConfig';
import { UserPosition } from '../../features/location';
import { Location, Route } from '../../routing/types';
import { isRecoverableRendererError } from '../rendererRecovery';
import { MapLocationSyncRequest, MapRenderer, RouteStepSelectHandler } from '../types';
import {
	CAMPUS_BUILDING_SOURCE_ID,
	CAMPUS_BUILDING_LABEL_SOURCE_ID,
	CAMPUS_PATH_SOURCE_ID,
	LOCATION_LABEL_SOURCE_ID,
	LOCATION_MARKER_SOURCE_ID,
	ROUTE_SOURCE_ID,
	SELECTED_BUILDING_SOURCE_ID,
	campusBuildingExtrusionLayer,
	campusBuildingExtrusionOpacity,
	campusBuildingLabelOpacity,
	campusBuildingLabelLayer,
	campusBuildingLabelSource,
	campusBuildingSource,
	locationMarkerLayers,
	campusPathLayers,
	campusPathLineOpacity,
	campusPathPointOpacity,
	campusPathSource,
	routeLayers,
	routePointHighlightLayer,
	routeToGeoJson,
	selectedBuildingLayers,
	selectedLocationLabelLayer
} from './MapLibreMapLayers';
import { createSoftCampusMapStyle } from './mapStyle';

type MapLibreMapRendererHostProps = {
	hasRoute: boolean;
	highlightedDirection: number | null;
	userPosition: UserPosition | null;
	onSelectRouteStep?: RouteStepSelectHandler;
	onRendererChange: (renderer: MapRenderer | null) => void;
	onRecoverableError?: (error: unknown) => void;
};

export function MapLibreMapRendererHost({
	hasRoute,
	highlightedDirection,
	userPosition,
	onSelectRouteStep,
	onRendererChange,
	onRecoverableError
}: MapLibreMapRendererHostProps) {
	const renderer = useMapLibreMapRenderer(hasRoute, highlightedDirection, userPosition, onRecoverableError, onSelectRouteStep);

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

export function useMapLibreMapRenderer(
	hasRoute = false,
	highlightedDirection: number | null = null,
	userPosition: UserPosition | null = null,
	onRecoverableError?: (error: unknown) => void,
	onSelectRouteStep?: RouteStepSelectHandler
): MapRenderer {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<Map | null>(null);
	const onSelectRouteStepRef = useRef(onSelectRouteStep);
	const [isReady, setIsReady] = useState(false);
	const [displayedRoute, setDisplayedRoute] = useState<Route | null>(null);
	const [routeOverlay, setRouteOverlay] = useState<ProjectedRouteOverlayFeature[]>([]);
	const [startMarkerLocation, setStartMarkerLocation] = useState<Location | null>(null);
	const [endMarkerLocation, setEndMarkerLocation] = useState<Location | null>(null);
	const routeVisibleRef = useRef(false);
	const displayedRouteRef = useRef<Route | null>(null);
	const highlightedDirectionRef = useRef<number | null>(null);

	useEffect(() => {
		onSelectRouteStepRef.current = onSelectRouteStep;
	}, [onSelectRouteStep]);

	useEffect(() => {
		displayedRouteRef.current = displayedRoute;
	}, [displayedRoute]);

	useEffect(() => {
		highlightedDirectionRef.current = highlightedDirection;
	}, [highlightedDirection]);

	useEffect(() => {
		if(!containerRef.current || mapRef.current) return;
		const terrainConfig = mapConfig.maplibre.terrain;

		let map: Map;
		try {
			map = new Map({
				container: containerRef.current,
				style: createSoftCampusMapStyle(mapConfig.tileUrl, mapConfig.attribution, terrainConfig),
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
		} catch (error) {
			if(isRecoverableRendererError(error)) {
				onRecoverableError?.(error);
				return;
			}
			throw error;
		}

		mapRef.current = map;

		map.on('error', event => {
			if(isTerrainSourceError(event, terrainConfig.sourceId)) {
				disableTerrain(map);
				return;
			}

			const error = event.error;
			if(isRecoverableRendererError(error)) onRecoverableError?.(error);
		});

		map.on('load', () => {
			try {
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
				map.addLayer(routePointHighlightLayer);
				registerRouteStepClickHandlers(map, step => onSelectRouteStepRef.current?.(step));
				map.addLayer(campusBuildingLabelLayer);
				map.addLayer(selectedLocationLabelLayer);
				applyRouteVisibilityMode(map, routeVisibleRef.current);
				setRouteOverlay(projectRouteOverlay(map, displayedRouteRef.current, highlightedDirectionRef.current));
				setIsReady(true);
			} catch (error) {
				if(isRecoverableRendererError(error)) {
					onRecoverableError?.(error);
					return;
				}
				throw error;
			}
		});

		return () => {
			map.remove();
			mapRef.current = null;
			setIsReady(false);
		};
	}, [onRecoverableError]);

	useEffect(() => {
		updateRouteSource(mapRef.current, displayedRoute, highlightedDirection);
		setRouteOverlay(projectRouteOverlay(mapRef.current, displayedRoute, highlightedDirection));
	}, [displayedRoute, highlightedDirection]);

	useEffect(() => {
		const map = mapRef.current;
		if(!map) return;

		const updateOverlay = () => {
			setRouteOverlay(projectRouteOverlay(map, displayedRoute, highlightedDirection));
		};

		map.on('move', updateOverlay);
		map.on('zoom', updateOverlay);
		map.on('pitch', updateOverlay);
		map.on('rotate', updateOverlay);
		map.on('resize', updateOverlay);
		updateOverlay();

		return () => {
			map.off('move', updateOverlay);
			map.off('zoom', updateOverlay);
			map.off('pitch', updateOverlay);
			map.off('rotate', updateOverlay);
			map.off('resize', updateOverlay);
		};
	}, [displayedRoute, highlightedDirection, isReady]);

	useEffect(() => {
		const routeVisible = hasRoute || displayedRoute != null;
		routeVisibleRef.current = routeVisible;
		applyRouteVisibilityMode(mapRef.current, routeVisible);
	}, [displayedRoute, hasRoute]);

	useEffect(() => {
		updateLocationLabelSource(mapRef.current, startMarkerLocation, endMarkerLocation);
		updateLocationMarkerSource(mapRef.current, startMarkerLocation, endMarkerLocation, userPosition);
	}, [startMarkerLocation, endMarkerLocation, userPosition]);

	return useMemo(() => ({
		mapElement: (
			<div className="relative h-full w-full">
				<div ref={containerRef} className="h-full w-full" />
				<RouteScreenOverlay features={routeOverlay} />
			</div>
		),
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
			const routeVisible = route != null;
			routeVisibleRef.current = routeVisible;
			applyRouteVisibilityMode(mapRef.current, routeVisible);
			setDisplayedRoute(route);
			fitRouteBounds(mapRef.current, route);
			return () => {
				routeVisibleRef.current = false;
				applyRouteVisibilityMode(mapRef.current, false);
				setDisplayedRoute(null);
			};
		},
		recenterUserLocation: position => {
			const target = position ?? userPosition;
			if(!target) return;

			mapRef.current?.easeTo(userLocationCameraOptions(target));
		}
	}), [isReady, routeOverlay, userPosition]);
}

type ProjectedRouteOverlayFeature = {
	kind: 'line' | 'point';
	color: string;
	isHighlighted: boolean;
	points: [number, number][];
};

function RouteScreenOverlay({ features }: { features: ProjectedRouteOverlayFeature[] }) {
	if(features.length == 0) return null;

	return (
		<svg
			className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
			aria-hidden="true"
		>
			{features.map((feature, index) => feature.kind == 'line' ? (
				<g key={index}>
					<polyline
						points={svgPoints(feature.points)}
						fill="none"
						stroke="#ffffff"
						strokeWidth={feature.isHighlighted ? 18 : 16}
						strokeLinecap="round"
						strokeLinejoin="round"
						opacity={0.95}
					/>
					<polyline
						points={svgPoints(feature.points)}
						fill="none"
						stroke={feature.color}
						strokeWidth={feature.isHighlighted ? 10 : 8}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			) : (
				<g key={index}>
					<circle
						cx={feature.points[0][0]}
						cy={feature.points[0][1]}
						r={feature.isHighlighted ? 10 : 8}
						fill="#ffffff"
						opacity={0.95}
					/>
					<circle
						cx={feature.points[0][0]}
						cy={feature.points[0][1]}
						r={feature.isHighlighted ? 6 : 4.8}
						fill={feature.color}
						stroke="#111827"
						strokeWidth={feature.isHighlighted ? 2.5 : 2}
					/>
				</g>
			))}
		</svg>
	);
}

function svgPoints(points: [number, number][]) {
	return points.map(point => point.join(',')).join(' ');
}

export function projectRouteOverlay(
	map: Pick<Map, 'project'> | null,
	route: Route | null,
	highlightedDirection: number | null
): ProjectedRouteOverlayFeature[] {
	if(!map || !route) return [];

	return routeToGeoJson(route, highlightedDirection).features.flatMap(feature => {
		const isHighlighted = Boolean(feature.properties.isHighlighted);
		const color = String(feature.properties.color);

		if(feature.geometry.type == 'LineString') {
			return [{
				kind: 'line' as const,
				color,
				isHighlighted,
				points: feature.geometry.coordinates.map(coordinate => {
					const point = map.project(coordinate);
					return [point.x, point.y] as [number, number];
				})
			}];
		}

		const point = map.project(feature.geometry.coordinates);
		return [{
			kind: 'point' as const,
			color,
			isHighlighted,
			points: [[point.x, point.y] as [number, number]]
		}];
	});
}

export function isTerrainSourceError(event: { sourceId?: string; error?: unknown }, terrainSourceId: string) {
	return event.sourceId == terrainSourceId;
}

function disableTerrain(map: Map) {
	try {
		map.setTerrain(null);
	} catch {
		// Terrain is optional. If disabling it fails, keep the renderer running flat.
	}
}

function applyRouteVisibilityMode(map: Map | null, routeVisible: boolean) {
	setPaintProperty(map, 'campus-building-extrusions', 'fill-extrusion-opacity', campusBuildingExtrusionOpacity(routeVisible));
	setPaintProperty(map, 'campus-path-line-casing', 'line-opacity', routeVisible ? 0.35 : 0.62);
	setPaintProperty(map, 'campus-path-lines', 'line-opacity', campusPathLineOpacity(routeVisible));
	setPaintProperty(map, 'campus-path-points', 'circle-opacity', campusPathPointOpacity(routeVisible));
	setPaintProperty(map, 'campus-building-labels', 'text-opacity', campusBuildingLabelOpacity(routeVisible));
}

const selectableRouteLayerIds = [
	'active-route-line-core',
	'active-route-line-highlight',
	'active-route-points',
	'active-route-point-highlight'
];

function registerRouteStepClickHandlers(map: Map, onSelectRouteStep: RouteStepSelectHandler) {
	const handleRouteClick = (event: MapLayerMouseEvent) => {
		const segmentIndex = routeStepFromEvent(event);
		if(segmentIndex == null) return;
		onSelectRouteStep(segmentIndex);
	};

	selectableRouteLayerIds.forEach(layerId => {
		map.on('click', layerId, handleRouteClick);
		map.on('mouseenter', layerId, () => {
			map.getCanvas().style.cursor = 'pointer';
		});
		map.on('mouseleave', layerId, () => {
			map.getCanvas().style.cursor = '';
		});
	});
}

export function routeStepFromEvent(event: Pick<MapLayerMouseEvent, 'features'>) {
	const segmentIndex = event.features?.[0]?.properties?.segmentIndex;
	if(typeof segmentIndex == 'number') return segmentIndex;
	if(typeof segmentIndex == 'string') {
		const parsedIndex = Number(segmentIndex);
		return Number.isFinite(parsedIndex) ? parsedIndex : null;
	}
	return null;
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
		padding: routeBoundsPadding(),
		maxZoom: mapConfig.maplibre.camera.routeZoom,
		pitch: mapConfig.maplibre.camera.defaultPitch,
		bearing: mapConfig.maplibre.camera.defaultBearing,
		duration: motionDuration()
	};
}

export function routeBoundsPadding() {
	if(typeof window == 'undefined') return mapConfig.maplibre.camera.routeBoundsPadding;
	if(!window.matchMedia) return mapConfig.maplibre.camera.routeBoundsPadding;
	return window.matchMedia('(max-width: 1023px)').matches
		? mapConfig.maplibre.camera.mobileRouteBoundsPadding
		: mapConfig.maplibre.camera.routeBoundsPadding;
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
