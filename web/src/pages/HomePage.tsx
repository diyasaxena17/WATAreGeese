import { FormEvent, PointerEvent, useState, useEffect, useMemo, useRef } from 'react';

import { BuildingSearchResult } from '../campus-data/buildingSearch';
import { getStartEndLocations, getBuildingFloorOptions, OptionType } from '../map/locations';
import { Route } from '../algorithm/dijkstra';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import Sheet from '../components/ui/Sheet';
import SectionHeader from '../components/ui/SectionHeader';
import DirectionsPanel from '../features/directions/DirectionsPanel';
import RouteSummary from '../features/directions/RouteSummary';
import { RouteEndpointSummary } from '../features/directions/types';
import RouteForm from '../features/navigation/RouteForm';
import { NavigationService } from '../features/navigation/navigationService';
import { useMapRenderer } from '../map-rendering';

export default function HomePage() {
	const navigationService = useMemo(() => new NavigationService(), []);
	const startEndLocations = useMemo(() => getStartEndLocations(), []);
	const buildingFloorOptions = useMemo(() => getBuildingFloorOptions(), []);

	const [startBuilding, setStartBuilding] = useState<BuildingSearchResult | null>(null);
	const [endBuilding, setEndBuilding] = useState<BuildingSearchResult | null>(null);

	const [hasRoute, setHasRoute] = useState(false);
	const [route, setRoute] = useState<Route | null>(null);
	const [highlightedDirection, setHighlightedDirection] = useState<number | null>(null);
	const [routeClear, setRouteClear] = useState<() => void>(() => () => { });

	const [showInput, setShowInput] = useState(true);
	const [showDirections, setShowDirections] = useState(false);
	const [isMobileSheetMinimized, setIsMobileSheetMinimized] = useState(false);
	const sheetDragStartY = useRef<number | null>(null);
	const mapRenderer = useMapRenderer(hasRoute, highlightedDirection);

	const startBuildingOption = useMemo(() => toBuildingOption(startBuilding), [startBuilding]);
	const endBuildingOption = useMemo(() => toBuildingOption(endBuilding), [endBuilding]);
	const startFloorOption = useMemo(() => toFloorOption(startBuilding, buildingFloorOptions), [startBuilding, buildingFloorOptions]);
	const endFloorOption = useMemo(() => toFloorOption(endBuilding, buildingFloorOptions), [endBuilding, buildingFloorOptions]);

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
			setRoute(navigationService.calculateRoute({ start: startLocation, end: endLocation }).route);
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
	};

	const handleStartBuildingChange = (building: BuildingSearchResult) => {
		clearDisplayedRoute();
		setStartBuilding(building);
	};

	const handleEndBuildingChange = (building: BuildingSearchResult) => {
		clearDisplayedRoute();
		setEndBuilding(building);
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
			onFromChange={handleStartBuildingChange}
			onToChange={handleEndBuildingChange}
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

	return (
		<AppShell
			map={mapRenderer.mapElement}
			panel={
				<Panel className="m-4 shadow-none">
					<div className="space-y-4">
						<SectionHeader
							title="WATAreGeese 🪿"
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
							<SectionHeader title="WATAreGeese 🪿" description="Waterloo, without the outside." />
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

function toFloorOption(building: BuildingSearchResult | null, buildingFloorOptions: Map<string, string[]>): OptionType | null {
	if(!building) return null;
	const floor = defaultFloor(buildingFloorOptions.get(building.buildingCode) ?? building.floors);
	if(!floor) return null;
	return { value: floor, label: floor };
}

function defaultFloor(floors: string[]) {
	return floors.includes('1') ? '1' : floors[0] ?? null;
}
