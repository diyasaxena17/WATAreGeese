import { FormEvent, PointerEvent, useState, useEffect, useMemo, useRef } from 'react';

import { BuildingSearchResult } from '../campus-data/buildingSearch';
import { getStartEndLocations, getBuildingFloorOptions, OptionType } from '../map/locations';
import { Route } from '../algorithm/dijkstra';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import MapControlButton from '../components/ui/MapControlButton';
import Panel from '../components/ui/Panel';
import Sheet from '../components/ui/Sheet';
import SectionHeader from '../components/ui/SectionHeader';
import DirectionsPanel from '../features/directions/DirectionsPanel';
import RouteSummary from '../features/directions/RouteSummary';
import { RouteEndpointSummary } from '../features/directions/types';
import { LocationService, useUserLocation } from '../features/location';
import RouteForm, { TunnellingPreference } from '../features/navigation/RouteForm';
import { NavigationService } from '../features/navigation/navigationService';
import { useMapRenderer } from '../map-rendering';

export type HomePageProps = {
	locationService?: LocationService;
};

export default function HomePage({ locationService }: HomePageProps = {}) {
	const navigationService = useMemo(() => new NavigationService(), []);
	const userLocation = useUserLocation(locationService);
	const startEndLocations = useMemo(() => getStartEndLocations(), []);
	const buildingFloorOptions = useMemo(() => getBuildingFloorOptions(), []);

	const [startBuilding, setStartBuilding] = useState<BuildingSearchResult | null>(null);
	const [endBuilding, setEndBuilding] = useState<BuildingSearchResult | null>(null);
	const [startFloor, setStartFloor] = useState<string | null>(null);
	const [endFloor, setEndFloor] = useState<string | null>(null);
	const [tunnellingPreference, setTunnellingPreference] = useState<TunnellingPreference>('no-the-geese');

	const [hasRoute, setHasRoute] = useState(false);
	const [route, setRoute] = useState<Route | null>(null);
	const [highlightedDirection, setHighlightedDirection] = useState<number | null>(null);
	const [routeClear, setRouteClear] = useState<() => void>(() => () => { });

	const [showInput, setShowInput] = useState(true);
	const [showDirections, setShowDirections] = useState(false);
	const [isMobileSheetMinimized, setIsMobileSheetMinimized] = useState(false);
	const sheetDragStartY = useRef<number | null>(null);
	const mapRenderer = useMapRenderer(hasRoute, highlightedDirection, userLocation.position);

	const startBuildingOption = useMemo(() => toBuildingOption(startBuilding), [startBuilding]);
	const endBuildingOption = useMemo(() => toBuildingOption(endBuilding), [endBuilding]);
	const startFloorOption = useMemo(() => toFloorOption(startBuilding, startFloor, buildingFloorOptions), [startBuilding, startFloor, buildingFloorOptions]);
	const endFloorOption = useMemo(() => toFloorOption(endBuilding, endFloor, buildingFloorOptions), [endBuilding, endFloor, buildingFloorOptions]);

	const startLocation = useMemo(() => mapRenderer.syncStartLocation({
		building: startBuildingOption,
		floor: startFloorOption,
		startEndLocations,
		route: null,
		clearRoute: routeClear,
		setClearRoute: setRouteClear,
		setRoute,
		setHasRoute
	}), [
		mapRenderer, startBuildingOption, startFloorOption, startEndLocations, routeClear
	]);
	const endLocation = useMemo(() => mapRenderer.syncEndLocation({
		building: endBuildingOption,
		floor: endFloorOption,
		startEndLocations,
		route: null,
		clearRoute: routeClear,
		setClearRoute: setRouteClear,
		setRoute,
		setHasRoute
	}), [
		mapRenderer, endBuildingOption, endFloorOption, startEndLocations, routeClear
	]);

	useEffect(() => {
		mapRenderer.setLocationMarkers(startLocation, endLocation);
	}, [mapRenderer, startLocation, endLocation]);

	useEffect(() => {
		if (hasRoute) {
			console.log(route?.graphLocations);
			setRouteClear((clearPreviousRoute) => {
				clearPreviousRoute();
				return mapRenderer.displayRoute(route);
			});
		} else {
			setHighlightedDirection(null);
		}
	}, [mapRenderer, route, hasRoute]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (mapRenderer.isReady && startLocation && endLocation) {
			console.log(`Start: ${startLocation.toString()}, End: ${endLocation.toString()}`);
			setRoute(navigationService.calculateRoute({
				start: startLocation,
				end: endLocation,
				mode: routeModeForTunnellingPreference(tunnellingPreference)
			}).route);
			setHasRoute(true);
			setShowDirections(true);
			setShowInput(false);
			setHighlightedDirection(null);
		}
	};

	const handleSwapLocations = () => {
		clearDisplayedRoute();
		setStartBuilding(endBuilding);
		setEndBuilding(startBuilding);
		setStartFloor(endFloor);
		setEndFloor(startFloor);
	};

	const handleStartBuildingChange = (building: BuildingSearchResult) => {
		clearDisplayedRoute();
		setStartBuilding(building);
		setStartFloor(defaultFloor(floorsForBuilding(building, buildingFloorOptions)));
	};

	const handleEndBuildingChange = (building: BuildingSearchResult) => {
		clearDisplayedRoute();
		setEndBuilding(building);
		setEndFloor(defaultFloor(floorsForBuilding(building, buildingFloorOptions)));
	};

	const handleStartFloorChange = (floor: string) => {
		clearDisplayedRoute();
		setStartFloor(floor);
	};

	const handleEndFloorChange = (floor: string) => {
		clearDisplayedRoute();
		setEndFloor(floor);
	};

	const clearDisplayedRoute = () => {
		if(route) {
			routeClear();
			setRouteClear(() => () => {});
			setRoute(null);
			setHasRoute(false);
			setShowDirections(false);
			setHighlightedDirection(null);
		}
	};

	const renderForm = () => (
		<RouteForm
			from={startBuilding}
			to={endBuilding}
			fromFloor={startFloor}
			toFloor={endFloor}
			tunnellingPreference={tunnellingPreference}
			onFromChange={handleStartBuildingChange}
			onToChange={handleEndBuildingChange}
			onFromFloorChange={handleStartFloorChange}
			onToFloorChange={handleEndFloorChange}
			onTunnellingPreferenceChange={setTunnellingPreference}
			onSwap={handleSwapLocations}
			onSubmit={handleSubmit}
		/>
	);

	const showRouteForm = () => {
		setShowInput(true);
		setShowDirections(false);
		setHighlightedDirection(null);
	};

	const renderDirectionsPanel = (variant: 'mobile' | 'desktop') => (
		<DirectionsPanel
			variant={variant}
			route={route}
			onChangeRoute={showRouteForm}
			from={toRouteEndpoint(startBuilding)}
			to={toRouteEndpoint(endBuilding)}
			selectedDirection={highlightedDirection}
			onHighlightDirection={setHighlightedDirection}
			onSelectDirection={setHighlightedDirection}
			onClearHighlight={() => setHighlightedDirection(null)}
		/>
	);

	const handleSheetDragStart = (event: PointerEvent<HTMLButtonElement>) => {
		sheetDragStartY.current = event.clientY;
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const handleSheetDragEnd = (event: PointerEvent<HTMLButtonElement>) => {
		if(sheetDragStartY.current != null && event.clientY - sheetDragStartY.current > 80) {
			setIsMobileSheetMinimized(true);
		}
		sheetDragStartY.current = null;
	};

	const handleCurrentLocation = async () => {
		if(userLocation.position) {
			mapRenderer.recenterUserLocation(userLocation.position);
			return;
		}

		const position = await userLocation.requestLocation();
		if(position) mapRenderer.recenterUserLocation(position);
	};

	const locationMessage = locationStatusMessage(userLocation.status, userLocation.error?.code);

	return (
		<AppShell
			map={mapRenderer.mapElement}
			mapControls={
				<div className="flex flex-col items-end gap-2">
					<MapControlButton
						aria-label={userLocation.position ? 'Recenter on current location' : 'Use current location'}
						icon={userLocation.status == 'requesting' ? '…' : '⌖'}
						pressed={userLocation.status == 'available'}
						disabled={userLocation.status == 'requesting'}
						onClick={handleCurrentLocation}
					/>
					{locationMessage ? (
						<div
							role={userLocation.status == 'requesting' ? 'status' : 'alert'}
							className="max-w-64 rounded-panel border border-border bg-surface px-3 py-2 text-wg-body-secondary shadow-panel"
						>
							{locationMessage}
						</div>
					) : null}
				</div>
			}
			panel={
				<Panel className="m-4 shadow-none">
					<div className="space-y-4">
						<SectionHeader
							title={<BrandTitle />}
							description="Waterloo, without the outside."
						/>
						{hasRoute && !showInput ? (
							<div className="space-y-4">
								{showDirections ? renderDirectionsPanel('desktop') : (
									<RouteSummary
										route={route}
										from={toRouteEndpoint(startBuilding)}
										to={toRouteEndpoint(endBuilding)}
										onChangeRoute={showRouteForm}
									/>
								)}
							</div>
						) : renderForm()}
						<a
							className="wg-body-secondary inline-flex underline decoration-border underline-offset-4 hover:text-text-primary"
							href="https://github.com/diyasaxena17/WATAreGeese"
						>
							About / credits
						</a>
						{hasRoute ? (
							<Button variant="secondary" className="w-full" onClick={() => setShowDirections(!showDirections)}>
								{showDirections ? 'Hide directions' : 'Show directions'}
							</Button>
						) : null}
					</div>
				</Panel>
			}
			sheet={isMobileSheetMinimized ? (
				<div className="rounded-panel border border-border bg-surface p-2 shadow-panel">
					<Button
						variant="secondary"
						className="w-full justify-between"
						onClick={() => setIsMobileSheetMinimized(false)}
					>
						{startBuilding && endBuilding ? `${startBuilding.buildingCode} to ${endBuilding.buildingCode}` : 'Plan route'}
					</Button>
				</div>
			) : (
				<Sheet
					handleLabel="Drag route planner down to minimize"
					onHandlePointerDown={handleSheetDragStart}
					onHandlePointerUp={handleSheetDragEnd}
					onHandlePointerCancel={() => {
						sheetDragStartY.current = null;
					}}
					header={
						<div>
							<SectionHeader title={<BrandTitle />} description="Waterloo, without the outside." />
						</div>
					}
				>
					<div className="space-y-4">
						{showInput ? renderForm() : (
							<div className="space-y-4">
								{showDirections ? renderDirectionsPanel('mobile') : (
									<RouteSummary
										route={route}
										from={toRouteEndpoint(startBuilding)}
										to={toRouteEndpoint(endBuilding)}
										onChangeRoute={showRouteForm}
									/>
								)}
							</div>
						)}
						{hasRoute ? (
							<Button variant="secondary" className="w-full" onClick={() => setShowDirections(!showDirections)}>
								{showDirections ? 'Hide directions' : 'Show directions'}
							</Button>
						) : null}
					</div>
				</Sheet>
			)}
		>
			{hasRoute && mapRenderer.canRenderDirections && showDirections ? null : ''}
		</AppShell>
	);
}

function BrandTitle() {
	return (
		<span className="inline-flex items-center gap-2">
			<span aria-hidden="true" className="text-xl leading-none">🪿</span>
			<span>WATAreGeese</span>
		</span>
	);
}

function locationStatusMessage(status: ReturnType<typeof useUserLocation>['status'], code?: string) {
	if(status == 'requesting') return 'Finding your location...';
	if(status == 'denied') return 'Location access was denied. Enable location permission in your browser to show your position.';
	if(status == 'unavailable') {
		if(code == 'unsupported-browser') return 'Current location is not supported by this browser.';
		if(code == 'timeout') return 'Current location took too long. You can try again.';
		return 'Current location is unavailable. Building-to-building routing still works.';
	}
	if(status == 'error') return 'Current location could not be shown. Building-to-building routing still works.';
	return null;
}

function toRouteEndpoint(building: BuildingSearchResult | null): RouteEndpointSummary | null {
	if(!building) return null;
	return {
		id: building.id,
		code: building.buildingCode,
		name: building.officialName
	};
}

function toBuildingOption(building: BuildingSearchResult | null): OptionType | null {
	if(!building) return null;
	return { value: building.buildingCode, label: building.label };
}

function toFloorOption(building: BuildingSearchResult | null, floor: string | null, buildingFloorOptions: Map<string, string[]>): OptionType | null {
	if(!building || !floor) return null;
	const availableFloors = floorsForBuilding(building, buildingFloorOptions);
	if(!availableFloors.includes(floor)) return null;
	return { value: floor, label: floor };
}

function floorsForBuilding(building: BuildingSearchResult, buildingFloorOptions: Map<string, string[]>) {
	return buildingFloorOptions.get(building.buildingCode) ?? building.floors;
}

function defaultFloor(floors: string[]) {
	return floors.includes('1') ? '1' : floors[0] ?? null;
}

function routeModeForTunnellingPreference(preference: TunnellingPreference) {
	return preference == 'touch-grass' ? 'shortest' : 'avoid-outside';
}
