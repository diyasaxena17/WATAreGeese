import { getDistance } from 'geolib';

import { CAMPUS_FEATURE_TYPES } from '../campus-data/schema';
import { Coordinate, BuildingFloor, Location, Edge, GeoJsonLine, GeoJsonStairs, GeoJsonDoorOrOpen, GeoJson } from './types';

const precision = 0.01;

export class AdjacencyList {
    private readonly _map: Map<String, Edge[]>;

    constructor(geoJson: GeoJson) {
        this._map = new Map();

        // add lines as edges
        (geoJson.features.filter(f => f.geometry.type == 'LineString') as GeoJsonLine[])
        .map(f => {
            let edges: Edge[] = [];
            if(!(f.properties.start.buildingCode == f.properties.end.buildingCode &&
                f.properties.start.floor == f.properties.end.floor)) {
                // start and end point at different buildingfloors
                const coords = f.geometry.coordinates.map(coord => new Coordinate(coord));
                let length = 0;
                for(let i = 0; i < coords.length-1; i++) {
                    length += getDistance(coords[i], coords[i+1], precision);
                }
                
                edges.push(new Edge(
                    new Location(coords[0], new BuildingFloor(f.properties.start)),
                    new Location(coords[coords.length-1], new BuildingFloor(f.properties.end)),
                    length, 0,
                    f.properties.type,
                    f.geometry.coordinates
                ));
            } else {// start and end point at same buildingfloor
                for(let i = 0; i < f.geometry.coordinates.length-1; i++) {
                    const start = new Coordinate(f.geometry.coordinates[i]);
                    const end = new Coordinate(f.geometry.coordinates[i+1]);
                    edges.push(new Edge(
                        new Location(start, new BuildingFloor(f.properties.start)),
                        new Location(end, new BuildingFloor(f.properties.end)),
                        getDistance(start, end, precision), 0,
                        f.properties.type,
                        f.geometry.coordinates.slice(i, i+2)
                    ));
                }
            }
            return edges;
        }).flat()
        .forEach(edge => this._addBidirectionalEdge(edge));

        // add 'open' and 'door' as edges
        (geoJson.features.filter(f => f.properties.type == CAMPUS_FEATURE_TYPES.OPEN || f.properties.type == CAMPUS_FEATURE_TYPES.DOOR) as GeoJsonDoorOrOpen[])
        .forEach(f => {
            const coord = new Coordinate(f.geometry.coordinates);
            this._addBidirectionalEdge(new Edge(
                new Location(coord, new BuildingFloor(f.properties.start)),
                new Location(coord, new BuildingFloor(f.properties.end)),
                0, 0,
                f.properties.type,
                [f.geometry.coordinates]
            ));
        });

        // add 'stairs', include all n*(n-1)/2 pairs as edges
        (geoJson.features.filter(f => f.properties.type == CAMPUS_FEATURE_TYPES.STAIRS) as GeoJsonStairs[])
        .forEach(f => {
            const coord = new Coordinate(f.geometry.coordinates);
            const buildingFloors = (f.properties.connections ?? []).map(connection => new BuildingFloor(connection));
            for(let i = 0; i < buildingFloors.length; i++) {
                for(let j = i+1; j < buildingFloors.length; j++) {
                    this._addBidirectionalEdge(new Edge(
                        new Location(coord, buildingFloors[i]),
                        new Location(coord, buildingFloors[j]),
                        0, f.properties.connections[j].level - f.properties.connections[i].level,
                        f.properties.type,
                        [f.geometry.coordinates]
                    ));
                }
            }
        });
    }

    private _addBidirectionalEdge(edge: Edge) {
        const startStr = edge.start.toString();
        const endStr = edge.end.toString();
        if(this._map.get(startStr) == undefined) this._map.set(startStr, []);
        this._map.get(startStr)?.push(edge);
        if(this._map.get(endStr) == undefined) this._map.set(endStr, []);
        this._map.get(endStr)?.push(new Edge(edge.end, edge.start, edge.length, -edge.floorChange, edge.type, edge.coordinates.toReversed()));
    }

    get(location: Location): Edge[] {
        return this._map.get(location.toString()) ?? [];
    }
};
