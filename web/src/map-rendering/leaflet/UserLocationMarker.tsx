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
                        fillOpacity: 0.1,
                        opacity: 0.32,
                        weight: 1.5
                    }}
                />
            ) : null}
            <CircleMarker
                center={center}
                radius={9}
                pathOptions={{
                    color: 'var(--color-text-primary)',
                    fillColor: 'var(--color-route)',
                    fillOpacity: 1,
                    opacity: 1,
                    weight: 2
                }}
            />
            <CircleMarker
                center={center}
                radius={6}
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
