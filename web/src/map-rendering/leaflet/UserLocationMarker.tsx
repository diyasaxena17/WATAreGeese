import { Circle, CircleMarker } from 'react-leaflet';

import { UserPosition } from '../../features/location';
import { toLeafletUserPosition } from './userLocationCoordinates';

export type UserLocationMarkerProps = {
    position: UserPosition | null;
};

export default function UserLocationMarker({ position }: UserLocationMarkerProps) {
    if(!position) return null;

    const center = toLeafletUserPosition(position);

    return (
        <>
            {position.accuracyMeters != null ? (
                <Circle
                    center={center}
                    radius={position.accuracyMeters}
                    pathOptions={{
                        color: 'var(--color-route)',
                        fillColor: 'var(--color-route)',
                        fillOpacity: 0.08,
                        opacity: 0.25,
                        weight: 1
                    }}
                />
            ) : null}
            <CircleMarker
                center={center}
                radius={7}
                pathOptions={{
                    color: 'var(--color-surface)',
                    fillColor: 'var(--color-route)',
                    fillOpacity: 1,
                    opacity: 1,
                    weight: 3
                }}
            />
        </>
    );
}
