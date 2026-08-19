import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

import { mapConfig } from '../../features/map/config/mapConfig';
import { UserPosition } from '../../features/location';

export default function UserLocationViewport({ target }: { target: UserPosition | null }) {
    const map = useMap();

    useEffect(() => {
        if(!target) return;
        map.setView([target.coordinates.latitude, target.coordinates.longitude], Math.max(map.getZoom(), mapConfig.userLocationZoom));
    }, [map, target]);

    return null;
}
