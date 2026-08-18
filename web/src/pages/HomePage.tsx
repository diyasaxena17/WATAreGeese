import { useState, useEffect, useMemo } from 'react';
import { SingleValue } from 'react-select';

import { getRoutingGeoJson } from '../campus-data/selectors';
import { getStartEndLocations, getBuildingFloorOptions, getBuildingOptions, getFloorOptions, OptionType } from '../map/locations';
import { Dijkstra, AdjacencyList, Route, GraphLocation } from '../algorithm/dijkstra';
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

export default function HomePage() {
	const UWMap = useMemo(() => new Dijkstra(new AdjacencyList(getRoutingGeoJson())), []);
	const { googleMap } = useLoadMap();
	const { library: Markers } = useGoogleMapsLibrary("marker");

	const startEndLocations = useMemo(getStartEndLocations, []);
	const buildingFloorOptions = useMemo(getBuildingFloorOptions, []);

	const [startBuilding, setStartBuilding] = useState<SingleValue<OptionType>>(null);
	const [startFloor, setStartFloor] = useState<SingleValue<OptionType>>(null);
	const [startLocationMarker, setStartLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
	const [endBuilding, setEndBuilding] = useState<SingleValue<OptionType>>(null);
	const [endFloor, setEndFloor] = useState<SingleValue<OptionType>>(null);
	const [endLocationMarker, endStartLocationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
	const [tunnellingPreference, setTunnellingPreference] = useState<OptionType>(Dijkstra.COMPARATOR_OPTIONS[0]);

	const [hasRoute, setHasRoute] = useState(false);
	const [route, setRoute] = useState<Route | null>(null);
	// Index of current direction instruction being displayed (one indexed)
	const [currentDirection, setCurrentDirection] = useState<number>(0);
	const [routeClear, setRouteClear] = useState<() => void>(() => () => { });

	const [showInput, setShowInput] = useState(true);
	const [showDirections, setShowDirections] = useState(false);

	const buildingOptions = useMemo(getBuildingOptions(buildingFloorOptions), []);
	const startFloorOptions = useMemo(getFloorOptions(buildingFloorOptions, startBuilding), [startBuilding]);
	const endFloorOptions = useMemo(getFloorOptions(buildingFloorOptions, endBuilding), [endBuilding]);

	const startLocation = useMemo(updateLocation(
		startBuilding, startFloor, startEndLocations, startLocationMarker, setStartLocationMarker, route, setRoute,
		routeClear, setRouteClear, setHasRoute, googleMap, Markers
	), [startBuilding, startFloor, tunnellingPreference]);
	const endLocation = useMemo(updateLocation(
		endBuilding, endFloor, startEndLocations, endLocationMarker, endStartLocationMarker, route, setRoute,
		routeClear, setRouteClear, setHasRoute, googleMap, Markers,
		Markers ? new Markers.PinElement({
			background: '#009933',
			borderColor: '#196619',
			glyphColor: '#196619'
		}).element : undefined
	), [endBuilding, endFloor, tunnellingPreference]);

	useBaseGeoJson(googleMap, hasRoute);

	useEffect(() => {
		if (hasRoute) {
			console.log(route?.graphLocations);
			routeClear();
			setRouteClear(displayRoute(googleMap, route));
			setCurrentDirection(1);
		} else {
			setCurrentDirection(0);
		}
	}, [route, hasRoute]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (googleMap && startLocation && endLocation) {
			console.log(`Start: ${startLocation.toString()}, End: ${endLocation.toString()}`);
			setRoute(UWMap.calculateRoute(startLocation, endLocation, Dijkstra.COMPARATORS.get(tunnellingPreference.value)));
			setHasRoute(true);
			setShowDirections(true);
			setShowInput(false);
		}
	};

	const handleStartBuildingChange = (newVal: SingleValue<OptionType>) => {
		setStartBuilding(newVal);
		setStartFloor(null);
	};

	const handleEndBuildingChange = (newVal: SingleValue<OptionType>) => {
		setEndBuilding(newVal);
		setEndFloor(null);
	};

	const form = (
		<RouteForm
			buildingOptions={buildingOptions}
			startFloorOptions={startFloorOptions}
			endFloorOptions={endFloorOptions}
			startBuilding={startBuilding}
			startFloor={startFloor}
			endBuilding={endBuilding}
			endFloor={endFloor}
			tunnellingPreference={tunnellingPreference}
			onStartBuildingChange={handleStartBuildingChange}
			onStartFloorChange={setStartFloor}
			onEndBuildingChange={handleEndBuildingChange}
			onEndFloorChange={setEndFloor}
			onTunnellingPreferenceChange={newVal => {
				if(newVal) setTunnellingPreference(newVal);
			}}
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
							title="WATAreGeese"
							description="Find indoor routes through Waterloo tunnels and bridges."
						/>
						{form}
						{hasRoute ? (
							<Button variant="secondary" className="w-full" onClick={() => setShowDirections(!showDirections)}>
								{showDirections ? 'Hide directions' : 'Show directions'}
							</Button>
						) : null}
					</div>
				</Panel>
			}
			sheet={
				<Sheet header={<SectionHeader title="WATAreGeese" description="Waterloo indoor routing" />}>
					<div className="space-y-4">
						{showInput ? form : (
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
