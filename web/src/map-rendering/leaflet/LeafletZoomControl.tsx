import { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

import MapControlButton from '../../components/ui/MapControlButton';

export default function LeafletZoomControl() {
	const map = useMap();
	const [zoom, setZoom] = useState(map.getZoom());

	useMapEvents({
		zoomend() {
			setZoom(map.getZoom());
		}
	});

	const minZoom = map.getMinZoom();
	const maxZoom = map.getMaxZoom();

	return (
		<div className="wg-hat-zoom-control leaflet-top leaflet-left" aria-label="Map zoom controls">
			<div className="leaflet-control flex flex-col gap-1 rounded-panel border border-white/55 p-1 shadow-panel">
				<MapControlButton
					aria-label="Zoom in"
					icon="+"
					disabled={zoom >= maxZoom}
					className="wg-hat-zoom-button"
					onClick={() => map.zoomIn()}
				/>
				<MapControlButton
					aria-label="Zoom out"
					icon="−"
					disabled={zoom <= minZoom}
					className="wg-hat-zoom-button"
					onClick={() => map.zoomOut()}
				/>
			</div>
		</div>
	);
}
