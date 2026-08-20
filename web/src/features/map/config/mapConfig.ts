export const mapConfig = {
	center: [43.4718, -80.543] as [number, number],
	defaultZoom: 16,
	userLocationZoom: 17,
	minZoom: 14,
	maxBounds: [
		[43.3, -80.7],
		[43.6, -80.3]
	] as [[number, number], [number, number]],
	tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};
