/* eslint-disable react-refresh/only-export-components */
import { Component, lazy, ReactNode, Suspense, useCallback, useMemo, useRef, useState } from 'react';

import { UserPosition } from '../features/location';
import { Location, Route } from '../routing/types';
import { isRecoverableRendererError } from './rendererRecovery';
import { MapLocationSyncRequest, MapRenderer, RouteDisplayCleanup } from './types';

const MapLibreMapRendererHost = lazy(() =>
	import('./maplibre/MapLibreMapRenderer').then(module => ({
		default: module.MapLibreMapRendererHost
	}))
);

const LeafletMapRendererHost = lazy(() =>
	import('./leaflet/LeafletMapRenderer').then(module => ({
		default: module.LeafletMapRendererHost
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
	const [fallbackReason, setFallbackReason] = useState<unknown>(null);

	const setRenderer = useCallback((renderer: MapRenderer | null) => {
		rendererRef.current = renderer;
		setIsReady(renderer?.isReady ?? false);
	}, []);

	const recoverToFallback = useCallback((error: unknown) => {
		setFallbackReason(error);
		rendererRef.current = null;
		setIsReady(false);
	}, []);

	return useMemo(() => ({
		mapElement: fallbackReason ? (
			<div className="relative h-full w-full">
				<Suspense fallback={<MapRendererLoadingState />}>
					<LeafletMapRendererHost
						hasRoute={hasRoute}
						highlightedDirection={highlightedDirection}
						userPosition={userPosition}
						onRendererChange={setRenderer}
					/>
					<RendererFallbackNotice />
				</Suspense>
			</div>
		) : (
			<RendererRecoveryBoundary onRecover={recoverToFallback}>
				<Suspense fallback={<MapRendererLoadingState />}>
					<MapLibreMapRendererHost
						hasRoute={hasRoute}
						highlightedDirection={highlightedDirection}
						userPosition={userPosition}
						onRendererChange={setRenderer}
						onRecoverableError={recoverToFallback}
					/>
				</Suspense>
			</RendererRecoveryBoundary>
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
	}), [fallbackReason, hasRoute, highlightedDirection, isReady, recoverToFallback, setRenderer, userPosition]);
}

type RendererRecoveryBoundaryProps = {
	children: ReactNode;
	onRecover: (error: unknown) => void;
};

type RendererRecoveryBoundaryState = {
	error: unknown;
	recovered: boolean;
};

class RendererRecoveryBoundary extends Component<RendererRecoveryBoundaryProps, RendererRecoveryBoundaryState> {
	state = { error: null, recovered: false };

	static getDerivedStateFromError(error: unknown) {
		return {
			error,
			recovered: isRecoverableRendererError(error)
		};
	}

	componentDidCatch(error: unknown) {
		if(isRecoverableRendererError(error)) {
			this.props.onRecover(error);
			return;
		}

		throw error;
	}

	render() {
		if(this.state.error && !this.state.recovered) throw this.state.error;
		if(this.state.recovered) return null;
		return this.props.children;
	}
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

function RendererFallbackNotice() {
	return (
		<div className="pointer-events-none absolute left-3 top-3 z-[1100] rounded-panel border border-border bg-surface px-3 py-2 text-wg-body-secondary shadow-panel">
			3D map unavailable - using compatibility mode.
		</div>
	);
}
