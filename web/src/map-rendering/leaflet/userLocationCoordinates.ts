import { UserPosition } from '../../features/location';

export type LeafletUserLocation = [number, number];

export function toLeafletUserPosition(position: UserPosition): LeafletUserLocation {
    return [position.coordinates.latitude, position.coordinates.longitude];
}
