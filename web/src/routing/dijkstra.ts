import { PriorityQueue, ICompare } from '@datastructures-js/priority-queue';

import { CAMPUS_FEATURE_TYPES } from '../campus-data/schema';
import { AdjacencyList } from './graph';
import { GraphLocation, Location, Route } from './types';
import { buildRoute } from './directions';

export class Dijkstra {
    /**
     * Walking speed in m/s
     */
    static readonly WALKING_SPEED = 1.25;
    /**
     * Time to ascend a floor in seconds
     */
    static readonly FLOOR_ASCEND_SPEED = 14;
    /**
     * Time to descend a floor in seconds
     */
    static readonly FLOOR_DESCEND_SPEED = 14;

    static readonly COMPARATOR_OPTIONS = [
        { value: 'COMPARE_BY_TIME_OUTSIDE_THEN_TIME', label: 'At all costs'},
        { value: 'COMPARE_BY_TIME', label: 'Where Possible'}
    ];

    static readonly COMPARATORS = new Map<string, ICompare<GraphLocation>>([
        [
            'COMPARE_BY_TIME',
            (a: GraphLocation, b: GraphLocation) => {
                return (a.time < b.time ? -1 : 1);
            }
        ], [
            'COMPARE_BY_TIME_OUTSIDE_THEN_TIME',
            (a: GraphLocation, b: GraphLocation) => {
                if(a.timeOutside == b.timeOutside) return (a.time < b.time ? -1 : 1);
                return (a.timeOutside < b.timeOutside ? -1 : 1)
            }
        ]
    ]);

    private readonly _dis: Map<String, number>;
    readonly adjList: AdjacencyList;

    constructor(adjList: AdjacencyList) {
        this._dis = new Map();
        this.adjList = adjList;
    }

    /**
     * Returns a Route object representing the route found. Returns null if no route is found.
     * If start and end are equal, a Route is returned with a single GraphLocation.
     */
    calculateRoute(start: Location, end: Location,
        comparator = Dijkstra.COMPARE_BY_TIME as ICompare<GraphLocation>): Route | null {
        const pq = new PriorityQueue<GraphLocation>(comparator);
        this._dis.clear();
        pq.push(new GraphLocation(start, [start.coordinate.toArray()]));
        this._setDistance(start, 0);
        while(!pq.isEmpty()) {
            const curr = pq.pop();
            if(curr.location.equals(end)) return buildRoute(curr);
            this.adjList.get(curr.location).forEach(edge => {
                if(curr.distance + edge.length < this._getDistance(edge.end)) {
                    const edgeTime = edge.length/Dijkstra.WALKING_SPEED + Math.abs(edge.floorChange)*(edge.floorChange > 0 ? Dijkstra.FLOOR_ASCEND_SPEED : Dijkstra.FLOOR_DESCEND_SPEED);
                    pq.push(new GraphLocation(
                        edge.end, edge.coordinates, curr, edge.type,
                        curr.distance + edge.length,
                        curr.time + edgeTime,
                        curr.timeOutside + (edge.type == CAMPUS_FEATURE_TYPES.WALKWAY ? edgeTime : 0),
                        edge.floorChange,
                        curr.floorsAscended+Math.max(edge.floorChange, 0),
                        curr.floorsDescended-Math.min(edge.floorChange, 0)
                    ));
                    this._setDistance(edge.end, curr.distance + edge.length);
                }
            });
        }
        return null;
    }

    private _getDistance(location: Location): number {
        return this._dis.get(location.toString()) ?? Infinity;
    }

    private _setDistance(location: Location, distance: number) {
        this._dis.set(location.toString(), distance);
    }
};
