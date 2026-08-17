import { useEffect, useMemo } from 'react';
import { CAMPUS_FEATURE_TYPES } from '../campus-data/schema';
import { getBuildingOutlines, getPathFeatures } from '../campus-data/selectors';
import formatPolyLine from '../map/formatPolyLine';
import formatPolygon from '../map/formatPolygon';

/**
 * Displays the base geoJson layer on the map
 */
export default function useBaseGeoJson(googleMap: any, hasRoute: boolean) {
	const baseGeoJson = useMemo(() => {
		if(googleMap) {
			const lines = getPathFeatures()
			.filter(feature => feature.geometry.type == 'LineString' && feature.properties.type != CAMPUS_FEATURE_TYPES.WALKWAY)
			.map(feature => new google.maps.Polyline(formatPolyLine(feature.geometry.coordinates, feature.properties.type)));
			const polygons = getBuildingOutlines()
			.map(feature => new google.maps.Polygon(formatPolygon(feature.geometry.coordinates[0])));

			return (lines as any[]).concat(polygons);
		}
		return [];
	}, [googleMap]);

	useEffect(() => {
		baseGeoJson.forEach(feature => {
			feature.setOptions({ strokeOpacity: (hasRoute ? 0.25 : 0.6)});
			feature.setMap(googleMap);
		});
	}, [baseGeoJson, hasRoute]);
}
