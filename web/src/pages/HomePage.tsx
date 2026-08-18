import { FormEvent, useState, useEffect, useMemo } from 'react';

import { BuildingSearchResult } from '../campus-data/buildingSearch';
import { getStartEndLocations, getBuildingFloorOptions, OptionType } from '../map/locations';
import { Route, GraphLocation } from '../algorithm/dijkstra';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import Sheet from '../components/ui/Sheet';
import SectionHeader from '../components/ui/SectionHeader';
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
	// Index of current direction instruction being displayed (one indexed)
	const [currentDirection, setCurrentDirection] = useState<number>(0);
	const [routeClear, setRouteClear] = useState<() => void>(() => () => { });

	const [showInput, setShowInput] = useState(true);
	const [showDirections, setShowDirections] = useState(false);
	const mapRenderer = useMapRenderer();

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
			setCurrentDirection(1);
		} else {
			setCurrentDirection(0);
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
						{renderForm()}
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
			sheet={
				<Sheet header={<SectionHeader title="WATAreGeese 🪿" description="Waterloo, without the outside." />}>
					<div className="space-y-4">
						{showInput ? renderForm() : (
							<Button variant="secondary" className="w-full" onClick={() => setShowInput(true)}>
								Show input
							</Button>
						)}
						{hasRoute ? (
							<Button variant="secondary" className="w-full" onClick={() => setShowDirections(!showDirections)}>
								{showDirections ? 'Hide directions' : 'Show directions'}
							</Button>
						) : null}
					</div>
				</Sheet>
			}
		>
			{hasRoute && mapRenderer.canRenderDirections && showDirections ?
				<div
					id="mobile-directions"
					className="z-20 visible md:invisible absolute top-[16%] w-[90%] bg-gray-200/85 py-1 shadow-2xl">
					{route != null ? <>
						<div className="pb-2">
							{statsString(route).map(str =>
								<div>{str}</div>
							)}
						</div>
						<div className="flex flex-row">
							<button
								className="px-1 text-xl"
								onClick={() => setCurrentDirection(Math.max(currentDirection-1, 1))}>{"◀️"}
							</button>
							<div className="grow">
								{mapRenderer.renderDirectionItem({
									graphLocation: route.graphLocations[currentDirection],
									order: currentDirection,
									onlyHighlightOnHover: false
								})}
							</div>
							<button
								className="px-1 text-xl"
								onClick={() => setCurrentDirection(Math.min(currentDirection+1, route.graphLocations.length-1))}>{"▶️"}
							</button>
						</div>
					</> : 'No routes found :('}
				</div>
			: ''}
			{hasRoute && mapRenderer.canRenderDirections && showDirections ?
				<div
					id="directions"
					className="z-20 invisible md:visible absolute left-[2%] w-auto top-[25%] max-h-[20%] md:max-h-[65%] overflow-y-auto p-4 bg-gray-200/85 shadow-2xl">
					{route != null ? <>
						<div className="pb-2">
							{statsString(route).map(str =>
								<div>{str}</div>
							)}
						</div>
						{route.graphLocations.slice(1).map((graphLocation, idx) =>
							mapRenderer.renderDirectionItem({
								graphLocation,
								order: idx + 1,
								onlyHighlightOnHover: true
							}))}
					</> : 'No routes found :('}
				</div>
			: ''}
		</AppShell>
	);
}

function statsString(route: Route) {
	const end = route.graphLocations.at(-1) as GraphLocation;
	const time = Math.round(end.time / 60);
	return [
		`Time: ${time == 0 ? '<1' : time}min, Distance: ${Math.round(end.distance ?? 0).toLocaleString()}m`,
		`⬆️${end.floorsAscended} floors, ⬇️ ${end.floorsDescended} floors`
	];
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
