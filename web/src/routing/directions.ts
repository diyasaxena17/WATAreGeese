import { CAMPUS_FEATURE_TYPES } from '../campus-data/schema';
import { BuildingFloor, GraphLocation, Route } from './types';

export function buildRoute(endLocation: GraphLocation) {
    const arr1: GraphLocation[] = [];
    let curr: GraphLocation | null = endLocation;
    while(curr != null) {
        arr1.push(curr);
        curr = curr.prevLocation;
    }
    arr1.reverse();
    const arr2: GraphLocation[] = [];
    // merge paths that start and end at the same building and floor (includes outside pathways as well)
    for(let i = 0; i < arr1.length; i++) {
        const prevprev = arr2.at(-2);
        const prev = arr2.at(-1);
        const curr = arr1[i];
        if(prevprev && prev && prevprev.location.buildingFloor.equals(prev.location.buildingFloor) &&
            prev.location.buildingFloor.equals(curr.location.buildingFloor) && prev.travelMode == curr.travelMode) {
            const newLoc = new GraphLocation(curr.location, prev.path.concat(curr.path.slice(1)),
            prev.prevLocation, curr.travelMode, curr.distance, curr.time, curr.timeOutside,
            curr.floorChange, curr.floorsAscended, curr.floorsDescended);
            arr2.pop();
            arr2.push(newLoc);
        } else arr2.push(curr);
    }

    const graphLocations: GraphLocation[] = [];
    // merge outdoor segments: [door(A, outside), walkway(outside, outside), door(outside, B)] => [walkway(A, B)]
    for(let i = 0; i < arr2.length; i++) {
        const curr = arr2[i];
        if(curr.travelMode == CAMPUS_FEATURE_TYPES.DOOR && curr.location.buildingFloor.buildingCode == 'OUT' && curr.location.buildingFloor.floor == '0') {
            console.assert(i+2 < arr2.length);
            const next = arr2[i+1];
            console.assert(next.travelMode == CAMPUS_FEATURE_TYPES.WALKWAY);
            const nextNext = arr2[i+2];
            console.assert(nextNext.travelMode == CAMPUS_FEATURE_TYPES.DOOR);
            graphLocations.push(new GraphLocation(
                nextNext.location, next.path.concat(nextNext.path.slice(1)),
                next.prevLocation, CAMPUS_FEATURE_TYPES.WALKWAY, nextNext.distance,
                nextNext.time, nextNext.timeOutside,
                nextNext.floorChange, nextNext.floorsAscended, nextNext.floorsDescended
            ));
            i += 2;
        } else graphLocations.push(curr);
    }

    return new Route(graphLocations);
}

export function toDirectionsString(graphLocation: GraphLocation) {
    const endBuilding = graphLocation.location.buildingFloor; // the building at the end of this segment
    let str = '';
    if(graphLocation.travelMode == CAMPUS_FEATURE_TYPES.OPEN) {
        str = `Continue into ${endBuilding.toDirectionString()}`;
    } else if(graphLocation.travelMode == CAMPUS_FEATURE_TYPES.DOOR) {
        str = `Go through the door to ${endBuilding.toDirectionString()}`;
    } else if(graphLocation.travelMode == CAMPUS_FEATURE_TYPES.STAIRS) {
        str = stairsDirection(graphLocation.floorChange, endBuilding);
    } else if(graphLocation.travelMode == CAMPUS_FEATURE_TYPES.HALLWAY) {
        str = `Take the ${graphLocation.travelMode} on ${endBuilding.toDirectionString()}`;
    } else if(graphLocation.travelMode == CAMPUS_FEATURE_TYPES.WALKWAY) {
        str = `Go outside and walk to ${endBuilding.toDirectionString()}`;
    } else {
        str = `Take the ${graphLocation.travelMode} to ${endBuilding.toDirectionString()}`;
    }
    return str;
}

function stairsDirection(floorChange: number, endBuilding: BuildingFloor) {
    if(floorChange == 0) return `Go through the stairwell to ${endBuilding.toDirectionString()}`;
    return `Go ${floorChange > 0 ? '⬆️' : '⬇️'} ${Math.abs(floorChange)} floor` +
        `${Math.abs(floorChange) == 1 ? '' : 's'} to ${endBuilding.toDirectionString()}`;
}
