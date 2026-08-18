import { CircleMarker, Polygon, Polyline } from 'react-leaflet';
import { useMemo } from 'react';

import { CAMPUS_FEATURE_TYPES, CampusFeatureType } from '../../campus-data/schema';
import { getBuildingOutlines, getPathFeatures } from '../../campus-data/selectors';
import { GraphLocation, Location, Route } from '../../routing/types';

type LeafletCoordinate = [number, number];

export function CampusLayers({ dimmed }: { dimmed: boolean }) {
	const pathFeatures = useMemo(() => getPathFeatures(), []);
	const buildingOutlines = useMemo(() => getBuildingOutlines(), []);
	const opacity = dimmed ? 0.25 : 0.6;

	return (
		<>
			{buildingOutlines.map((feature, index) => (
				<Polygon
					key={`outline-${index}`}
					positions={toLeafletPath(feature.geometry.coordinates[0])}
					pathOptions={{
						fillColor: 'black',
						fillOpacity: 0.12,
						color: 'black',
						weight: 0.4,
						opacity: 1
					}}
				/>
			))}
			{pathFeatures.map((feature, index) => {
				if(feature.geometry.type == 'LineString') {
					return (
						<Polyline
							key={`path-${index}`}
							positions={toLeafletPath(feature.geometry.coordinates)}
							pathOptions={{
								color: pathColor(feature.properties.type),
								weight: 4,
								opacity
							}}
						/>
					);
				}

				if(feature.geometry.type == 'Point') {
					return (
						<CircleMarker
							key={`point-${index}`}
							center={toLeafletCoordinate(feature.geometry.coordinates)}
							radius={pointRadius(feature.properties.type)}
							pathOptions={{
								color: pathColor(feature.properties.type),
								fillColor: pathColor(feature.properties.type),
								fillOpacity: opacity,
								opacity
							}}
						/>
					);
				}

				return null;
			})}
		</>
	);
}

export function LocationMarkers({ start, end }: { start: Location | null, end: Location | null }) {
	return (
		<>
			{start ? (
				<CircleMarker
					center={toLeafletCoordinate(start.coordinate.toArray())}
					radius={7}
					pathOptions={{
						color: 'var(--color-primary)',
						fillColor: 'var(--color-surface)',
						fillOpacity: 1,
						weight: 2
					}}
				/>
			) : null}
			{end ? (
				<CircleMarker
					center={toLeafletCoordinate(end.coordinate.toArray())}
					radius={7}
					pathOptions={{
						color: 'var(--color-primary)',
						fillColor: 'var(--color-primary)',
						fillOpacity: 0.95,
						weight: 2
					}}
				/>
			) : null}
		</>
	);
}

export function RouteLayers({ route, highlightedDirection }: { route: Route | null, highlightedDirection: number | null }) {
	if(!route) return null;

	return (
		<>
			{route.graphLocations.map((graphLocation, index) => {
				if(index == 0) return null;
				const isHighlighted = highlightedDirection == index;
				const positions = toLeafletPath(graphLocation.path);

				if(positions.length == 1) {
					return (
						<CircleMarker
							key={`route-${index}`}
							center={positions[0]}
							radius={isHighlighted ? 7 : 5}
							pathOptions={{
								color: isHighlighted ? 'var(--color-text-primary)' : routeColor(graphLocation),
								fillColor: isHighlighted ? 'var(--color-accent)' : routeColor(graphLocation),
								fillOpacity: 0.95,
								weight: isHighlighted ? 3 : 2
							}}
						/>
					);
				}

				return (
					<Polyline
						key={`route-${index}`}
						positions={positions}
						pathOptions={{
							color: isHighlighted ? 'var(--color-accent)' : routeColor(graphLocation),
							weight: isHighlighted ? 8 : 6,
							opacity: 1
						}}
					/>
				);
			})}
		</>
	);
}

function toLeafletPath(path: [number, number][]): LeafletCoordinate[] {
	return path.map(toLeafletCoordinate);
}

function toLeafletCoordinate(point: [number, number]): LeafletCoordinate {
	return [point[1], point[0]];
}

function pathColor(type: CampusFeatureType) {
	if(type == CAMPUS_FEATURE_TYPES.BRIDGE) return 'green';
	if(type == CAMPUS_FEATURE_TYPES.HALLWAY) return '#668cff';
	if(type == CAMPUS_FEATURE_TYPES.TUNNEL) return '#86592d';
	if(type == CAMPUS_FEATURE_TYPES.WALKWAY) return '#ff6666';
	if(type == CAMPUS_FEATURE_TYPES.DOOR) return 'var(--color-success)';
	if(type == CAMPUS_FEATURE_TYPES.OPEN) return 'var(--color-route)';
	if(type == CAMPUS_FEATURE_TYPES.STAIRS) return 'var(--color-warning)';
	return 'black';
}

function pointRadius(type: CampusFeatureType) {
	if(type == CAMPUS_FEATURE_TYPES.STAIRS) return 3.5;
	return 2.5;
}

function routeColor(graphLocation: GraphLocation) {
	return pathColor(graphLocation.travelMode as CampusFeatureType);
}
