import { FormEvent, useState, useEffect, useMemo } from 'react';

import { BuildingSearchResult } from '../campus-data/buildingSearch';
import { getStartEndLocations, getBuildingFloorOptions, OptionType } from '../map/locations';
import { Route, GraphLocation } from '../algorithm/dijkstra';
import displayRoute from '../map/displayRoute';
import useLoadMap from '../map/loadMap';
import useGoogleMapsLibrary from '../hooks/useGoogleMapsLibrary';
import updateLocation from '../map/updateLocation';
import DirectionsListItem from '../components/DirectionsListItem';
import useBaseGeoJson from '../hooks/useBaseGeoJson';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import Sheet from '../components/ui/Sheet';
import SectionHeader from '../components/ui/SectionHeader';
import RouteForm from '../features/navigation/RouteForm';
import { NavigationService } from '../features/navigation/navigationService';

export default function HomePage() {
	const navigationService = useMemo(() => new NavigationService(), []);
	const { googleMap } = useLoadMap();
	const { library: Markers } = useGoogleMapsLibrary("marker");

	const startEndLocations = useMemo(() => getStartEndLocations(), []);
	const buildingFloorOptions = useMemo(() => getBuildingFloorOptions(), []);

	const [startBuilding, setStartBuilding] = useState<BuildingSearchResult | null>(null);
	const [startLocationMarker, setStartLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
	const [endBuilding, setEndBuilding] = useState<BuildingSearchResult | null>(null);
	const [endLocationMarker, endStartLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

	const [hasRoute, setHasRoute] = useState(false);
	const [route, setRoute] = useState<Route | null>(null);
	// Index of current direction instruction being displayed (one indexed)
	const [currentDirection, setCurrentDirection] = useState<number>(0);
	const [routeClear, setRouteClear] = useState<() => void>(() => () => { });

	const [showInput, setShowInput] = useState(true);
	const [showDirections, setShowDirections] = useState(false);

	const startBuildingOption = useMemo(() => toBuildingOption(startBuilding), [startBuilding]);
	const endBuildingOption = useMemo(() => toBuildingOption(endBuilding), [endBuilding]);
	const startFloorOption = useMemo(() => toFloorOption(startBuilding, buildingFloorOptions), [startBuilding, buildingFloorOptions]);
	const endFloorOption = useMemo(() => toFloorOption(endBuilding, buildingFloorOptions), [endBuilding, buildingFloorOptions]);

	const startLocation = useMemo(() => updateLocation(
		startBuildingOption, startFloorOption, startEndLocations, startLocationMarker, setStartLocationMarker, route, setRoute,
		routeClear, setRouteClear, setHasRoute, googleMap, Markers
	)(), [
		startBuildingOption, startFloorOption, startEndLocations, startLocationMarker, route,
		routeClear, googleMap, Markers
	]);
	const endMarkerContent = useMemo(() => Markers ? new Markers.PinElement({
		background: '#009933',
		borderColor: '#196619',
		glyphColor: '#196619'
	}).element : undefined, [Markers]);
	const endLocation = useMemo(() => updateLocation(
		endBuildingOption, endFloorOption, startEndLocations, endLocationMarker, endStartLocationMarker, route, setRoute,
		routeClear, setRouteClear, setHasRoute, googleMap, Markers, endMarkerContent
	)(), [
		endBuildingOption, endFloorOption, startEndLocations, endLocationMarker, route,
		routeClear, googleMap, Markers, endMarkerContent
	]);

	useBaseGeoJson(googleMap, hasRoute);

	useEffect(() => {
		if (hasRoute) {
			console.log(route?.graphLocations);
			setRouteClear((clearPreviousRoute) => {
				clearPreviousRoute();
				return displayRoute(googleMap, route);
			});
			setCurrentDirection(1);
		} else {
			setCurrentDirection(0);
		}
	}, [googleMap, route, hasRoute]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (googleMap && startLocation && endLocation) {
			console.log(`Start: ${startLocation.toString()}, End: ${endLocation.toString()}`);
			setRoute(navigationService.calculateRoute({ start: startLocation, end: endLocation }).route);
			setHasRoute(true);
			setShowDirections(true);
			setShowInput(false);
		}
	};

	const handleSwapLocations = () => {
		setStartBuilding(endBuilding);
		setEndBuilding(startBuilding);
	};

	const renderForm = () => (
		<RouteForm
			from={startBuilding}
			to={endBuilding}
			onFromChange={setStartBuilding}
			onToChange={setEndBuilding}
			onSwap={handleSwapLocations}
			onSubmit={handleSubmit}
		/>
	);

	return (
		<AppShell
			map={<div id="map" className="h-full w-full" />}
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
			{hasRoute && googleMap && Markers && showDirections ?
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
								<DirectionsListItem googleMap={googleMap} graphLocation={route.graphLocations[currentDirection]} order={currentDirection} onlyHighlightOnHover={false} Markers={Markers}/>
							</div>
							<button
								className="px-1 text-xl"
								onClick={() => setCurrentDirection(Math.min(currentDirection+1, route.graphLocations.length-1))}>{"▶️"}
							</button>
						</div>
					</> : 'No routes found :('}
				</div>
			: ''}
			{hasRoute && googleMap && Markers && showDirections ?
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
							<DirectionsListItem googleMap={googleMap} graphLocation={graphLocation} order={idx + 1} onlyHighlightOnHover={true} Markers={Markers} />)}
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
