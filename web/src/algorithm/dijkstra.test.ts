import { describe, expect, it } from 'vitest';

import { CAMPUS_FEATURE_TYPES } from '../campus-data/schema';
import { getBuildings, getRoutingGeoJson } from '../campus-data/selectors';
import { NavigationService } from '../features/navigation/navigationService';
import { Dijkstra } from '../routing/dijkstra';
import { AdjacencyList } from '../routing/graph';
import { BuildingFloor, Coordinate, GeoJson, Location, Route } from '../routing/types';

type BuildingFeature = {
	properties: {
		type: 'building';
		building: {
			buildingCode: string;
			floors: string[];
		};
	};
	geometry: {
		coordinates: [number, number];
	};
};

const router = new Dijkstra(new AdjacencyList(getRoutingGeoJson() as GeoJson));
const navigationService = new NavigationService(router);

function campusLocation(buildingCode: string, floor: string): Location {
	const feature = (getBuildings() as BuildingFeature[]).find(building =>
		building.properties.type === CAMPUS_FEATURE_TYPES.BUILDING &&
		building.properties.building.buildingCode === buildingCode &&
		building.properties.building.floors.includes(floor)
	);

	if(!feature) throw new Error(`Missing campus location ${buildingCode} floor ${floor}`);

	return new Location(
		new Coordinate(feature.geometry.coordinates),
		new BuildingFloor({ buildingCode, floor })
	);
}

function calculateRoute(
	start: Location,
	end: Location,
	comparatorKey = 'COMPARE_BY_TIME_OUTSIDE_THEN_TIME'
): Route {
	const route = router.calculateRoute(
		start,
		end,
		Dijkstra.COMPARATORS.get(comparatorKey)
	);

	if(!route) throw new Error(`Expected route from ${start.toString()} to ${end.toString()}`);
	return route;
}

function routeModes(route: Route): string[] {
	return route.graphLocations
		.slice(1)
		.map(graphLocation => graphLocation.travelMode ?? '');
}

function routeFloors(route: Route): string[] {
	return route.graphLocations.map(graphLocation => graphLocation.location.buildingFloor.toString());
}

function expectRouteEndpoints(route: Route, start: Location, end: Location) {
	expect(route.graphLocations[0].location.equals(start)).toBe(true);
	expect(route.graphLocations.at(-1)?.location.equals(end)).toBe(true);
}

describe('WATIsGrass routing engine', () => {
	it('exposes calculateRoute on a Dijkstra instance as the public routing entry point', () => {
		expect(typeof router.calculateRoute).toBe('function');
	});

	it('exposes NavigationService.calculateRoute as the navigation interface', () => {
		const start = campusLocation('ML', '1');
		const end = campusLocation('SCH', '1');
		const result = navigationService.calculateRoute({ start, end, mode: 'shortest' });

		expect(result.route).not.toBeNull();
		expect(result.route?.graphLocations[0].location.equals(start)).toBe(true);
		expect(result.route?.graphLocations.at(-1)?.location.equals(end)).toBe(true);
	});

	it('routes between connected tunnel-network buildings while preserving endpoints', () => {
		const start = campusLocation('ML', '1');
		const end = campusLocation('SCH', '1');
		const route = calculateRoute(start, end);

		expectRouteEndpoints(route, start, end);
		expect(routeModes(route)).toContain('tunnel');
		expect(routeModes(route)).toMatchInlineSnapshot(`
			[
			  "hallway",
			  "tunnel",
			  "hallway",
			  "tunnel",
			  "hallway",
			]
		`);
		expect(routeFloors(route)).toMatchInlineSnapshot(`
			[
			  "ML|1",
			  "ML|1",
			  "AL|B",
			  "AL|B",
			  "SCH|1",
			  "SCH|1",
			]
		`);
		expect(route.graphLocations.at(-1)?.timeOutside).toBe(0);
	});

	it('routes between Engineering buildings through an open connection', () => {
		const start = campusLocation('E5', '3');
		const end = campusLocation('E7', '3');
		const route = calculateRoute(start, end);

		expectRouteEndpoints(route, start, end);
		expect(routeModes(route)).toContain('open');
		expect(routeModes(route)).toMatchInlineSnapshot(`
			[
			  "hallway",
			  "open",
			  "hallway",
			]
		`);
		expect(routeFloors(route)).toMatchInlineSnapshot(`
			[
			  "E5|3",
			  "E5|3",
			  "E7|3",
			  "E7|3",
			]
		`);
		expect(route.graphLocations.at(-1)?.timeOutside).toBe(0);
	});

	it('routes across bridge-connected campus buildings without outdoor time', () => {
		const start = campusLocation('MC', '3');
		const end = campusLocation('QNC', '2');
		const route = calculateRoute(start, end);

		expectRouteEndpoints(route, start, end);
		expect(routeModes(route)).toContain('bridge');
		expect(routeModes(route)).toMatchInlineSnapshot(`
			[
			  "hallway",
			  "bridge",
			  "hallway",
			]
		`);
		expect(routeFloors(route)).toMatchInlineSnapshot(`
			[
			  "MC|3",
			  "MC|3",
			  "QNC|2",
			  "QNC|2",
			]
		`);
		expect(route.graphLocations.at(-1)?.timeOutside).toBe(0);
	});

	it('routes vertically within a building and tracks descended floors', () => {
		const start = campusLocation('DP', '10');
		const end = campusLocation('DP', '1');
		const route = calculateRoute(start, end);

		expectRouteEndpoints(route, start, end);
		expect(routeModes(route)).toEqual(['stairs']);
		expect(routeFloors(route)).toEqual(['DP|10', 'DP|1']);
		expect(route.graphLocations.at(-1)).toMatchObject({
			distance: 0,
			time: 126,
			timeOutside: 0,
			floorsAscended: 0,
			floorsDescended: 9
		});
	});

	it('routes across campus by indoor paths when outdoor time is prioritized', () => {
		const start = campusLocation('DC', '1');
		const end = campusLocation('MC', '1');
		const route = calculateRoute(start, end);

		expectRouteEndpoints(route, start, end);
		expect(routeModes(route)).not.toContain('walkway');
		expect(routeModes(route)).toEqual(expect.arrayContaining(['bridge', 'tunnel', 'stairs']));
		expect(routeModes(route)).toMatchInlineSnapshot(`
			[
			  "stairs",
			  "hallway",
			  "bridge",
			  "hallway",
			  "stairs",
			  "hallway",
			  "tunnel",
			  "stairs",
			  "hallway",
			]
		`);
		expect(routeFloors(route)).toMatchInlineSnapshot(`
			[
			  "DC|1",
			  "DC|2",
			  "DC|2",
			  "C2|3",
			  "C2|3",
			  "C2|B",
			  "C2|B",
			  "MC|B",
			  "MC|1",
			  "MC|1",
			]
		`);
		expect(route.graphLocations.at(-1)?.timeOutside).toBe(0);
	});

	it('routes across outdoor gaps and collapses door-walkway-door into a walkway instruction when optimizing by time', () => {
		const start = campusLocation('DC', '1');
		const end = campusLocation('MC', '1');
		const route = calculateRoute(start, end, 'COMPARE_BY_TIME');

		expectRouteEndpoints(route, start, end);
		expect(routeModes(route)).toContain('walkway');
		expect(routeModes(route)).toMatchInlineSnapshot(`
			[
			  "hallway",
			  "walkway",
			  "hallway",
			]
		`);
		expect(routeFloors(route)).toMatchInlineSnapshot(`
			[
			  "DC|1",
			  "DC|1",
			  "MC|1",
			  "MC|1",
			]
		`);
		expect(route.graphLocations.at(-1)?.timeOutside).toBeGreaterThan(0);
	});
});
