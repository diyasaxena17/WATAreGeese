import { CAMPUS_FEATURE_TYPES } from "../campus-data/schema";

export default function formatPolyLine(path: [number, number][], type: string): google.maps.PolylineOptions {
    let strokeColor = 'black';
    if(type == CAMPUS_FEATURE_TYPES.BRIDGE) strokeColor = 'green';
    if(type == CAMPUS_FEATURE_TYPES.HALLWAY) strokeColor = '#668cff';
    if(type == CAMPUS_FEATURE_TYPES.TUNNEL) strokeColor = '#86592d';
    if(type == CAMPUS_FEATURE_TYPES.WALKWAY) strokeColor = '#ff6666';
    return {
        path: path.map(point => { return { lat: point[1], lng: point[0] } }) as any[],
        strokeColor: strokeColor,
        strokeWeight: 4,
        zIndex: 0
    };
}
