/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';

import { UserPosition } from '../features/location';
import { Location, Route } from '../routing/types';
import { MapLocationSyncRequest, MapRenderer, RouteDisplayCleanup } from './types';

const MapLibreMapRendererHost = lazy(() =>
	import('./maplibre/MapLibreMapRenderer').then(module => ({
		default: module.MapLibreMapRendererHost
	}))
);

const noopCleanup: RouteDisplayCleanup = () => {};

export function useLazyMapRenderer(
	hasRoute = false,
	highlightedDirection: number | null = null,
	userPosition: UserPosition | null = null
): MapRenderer {
	const rendererRef = useRef<MapRenderer | null>(null);
	const [isReady, setIsReady] = useState(false);

	const setRenderer = useCallback((renderer: MapRenderer | null) => {
		rendererRef.current = renderer;
		setIsReady(renderer?.isReady ?? false);
	}, []);

	return useMemo(() => ({
		mapElement: (
			<Suspense fallback={<MapRendererLoadingState />}>
				<MapLibreMapRendererHost
					hasRoute={hasRoute}
					highlightedDirection={highlightedDirection}
					userPosition={userPosition}
					onRendererChange={setRenderer}
				/>
			</Suspense>
		),
		isReady,
		canRenderDirections: rendererRef.current?.canRenderDirections ?? false,
		syncStartLocation: (request: MapLocationSyncRequest) =>
			rendererRef.current?.syncStartLocation(request) ?? null,
		syncEndLocation: (request: MapLocationSyncRequest) =>
			rendererRef.current?.syncEndLocation(request) ?? null,
		focusLocation: (location: Location | null) => {
			rendererRef.current?.focusLocation(location);
		},
		setLocationMarkers: (start: Location | null, end: Location | null) => {
			rendererRef.current?.setLocationMarkers(start, end);
		},
		displayRoute: (route: Route | null) =>
			rendererRef.current?.displayRoute(route) ?? noopCleanup,
		recenterUserLocation: (position?: UserPosition | null) => {
			rendererRef.current?.recenterUserLocation(position);
		}
	}), [hasRoute, highlightedDirection, isReady, setRenderer, userPosition]);
}

function MapRendererLoadingState() {
	return (
		<div className="wg-hat-map flex h-full w-full items-center justify-center bg-background">
			<div className="rounded-panel border border-border bg-surface px-4 py-3 text-wg-body-secondary shadow-panel">
				Loading campus map...
			</div>
		</div>
	);
}
