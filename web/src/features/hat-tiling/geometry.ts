export type Point = {
	x: number;
	y: number;
};

export type HatTileTransform = {
	x: number;
	y: number;
	rotation: number;
	reflected: boolean;
};

export type HatClusterKind = 'H1' | 'H2' | 'H7' | 'H8';

export type HatClusterDefinition = {
	kind: HatClusterKind;
	tiles: HatTileTransform[];
	anchors: Record<string, Point>;
};

const unit = 12;
const height = unit * Math.sqrt(3) / 2;
const canonicalHatEdges: Point[] = [
	{ x: 0, y: -Math.sqrt(3) },
	{ x: -1, y: 0 },
	{ x: -0.5, y: -Math.sqrt(3) / 2 },
	{ x: -1.5, y: Math.sqrt(3) / 2 },
	{ x: 0, y: Math.sqrt(3) },
	{ x: -1, y: 0 },
	{ x: -0.5, y: Math.sqrt(3) / 2 },
	{ x: 1.5, y: Math.sqrt(3) / 2 },
	{ x: 1.5, y: -Math.sqrt(3) / 2 },
	{ x: 0.5, y: Math.sqrt(3) / 2 },
	{ x: 2, y: 0 },
	{ x: 0.5, y: -Math.sqrt(3) / 2 }
];

export const hatPolygon: Point[] = buildCanonicalHatPolygon(unit);

export const hatClusters: Record<HatClusterKind, HatClusterDefinition> = {
	H1: {
		kind: 'H1',
		tiles: [{ x: 0, y: 0, rotation: 0, reflected: false }],
		anchors: {
			origin: { x: 0, y: 0 },
			east: { x: 6 * unit, y: 2 * height },
			south: { x: 2 * unit, y: 6 * height }
		}
	},
	H2: {
		kind: 'H2',
		tiles: [
			{ x: 0, y: 0, rotation: 0, reflected: false },
			{ x: 5 * unit, y: 2 * height, rotation: 180, reflected: true }
		],
		anchors: {
			origin: { x: 0, y: 0 },
			east: { x: 10 * unit, y: 2 * height },
			south: { x: 4 * unit, y: 7 * height }
		}
	},
	H7: {
		kind: 'H7',
		tiles: [
			{ x: 0, y: 0, rotation: 0, reflected: false },
			{ x: 5 * unit, y: 2 * height, rotation: 180, reflected: true },
			{ x: 2 * unit, y: 5 * height, rotation: 60, reflected: false },
			{ x: 7 * unit, y: 5 * height, rotation: 240, reflected: true },
			{ x: -2 * unit, y: 5 * height, rotation: 300, reflected: true },
			{ x: 3 * unit, y: 8 * height, rotation: 120, reflected: false },
			{ x: 8 * unit, y: 8 * height, rotation: 0, reflected: true }
		],
		anchors: {
			origin: { x: 0, y: 0 },
			east: { x: 13 * unit, y: 6 * height },
			south: { x: 4 * unit, y: 12 * height }
		}
	},
	H8: {
		kind: 'H8',
		tiles: [
			{ x: 0, y: 0, rotation: 0, reflected: false },
			{ x: 5 * unit, y: 2 * height, rotation: 180, reflected: true },
			{ x: 2 * unit, y: 5 * height, rotation: 60, reflected: false },
			{ x: 7 * unit, y: 5 * height, rotation: 240, reflected: true },
			{ x: -2 * unit, y: 5 * height, rotation: 300, reflected: true },
			{ x: 3 * unit, y: 8 * height, rotation: 120, reflected: false },
			{ x: 8 * unit, y: 8 * height, rotation: 0, reflected: true },
			{ x: 11 * unit, y: 3 * height, rotation: 300, reflected: false }
		],
		anchors: {
			origin: { x: 0, y: 0 },
			east: { x: 16 * unit, y: 6 * height },
			south: { x: 5 * unit, y: 12 * height }
		}
	}
};

export function substituteCluster(kind: HatClusterKind): HatClusterDefinition {
	if(kind == 'H1') return hatClusters.H8;
	if(kind == 'H2') return hatClusters.H7;
	return hatClusters[kind];
}

export function getHatClusterTiles(kind: HatClusterKind, levels: number): HatTileTransform[] {
	if(levels <= 0) return hatClusters[kind].tiles;

	const childKind = substituteCluster(kind).kind;
	return hatClusters[kind].tiles.flatMap(tile =>
		getHatClusterTiles(childKind, levels - 1).map(child => composeTransforms(tile, child))
	);
}

function composeTransforms(parent: HatTileTransform, child: HatTileTransform): HatTileTransform {
	const childPoint = parent.reflected
		? { x: -child.x, y: child.y }
		: { x: child.x, y: child.y };
	const rotatedPoint = rotatePoint(childPoint, parent.rotation);

	return {
		x: parent.x + rotatedPoint.x,
		y: parent.y + rotatedPoint.y,
		rotation: normalizeDegrees(parent.rotation + (parent.reflected ? -child.rotation : child.rotation)),
		reflected: parent.reflected != child.reflected
	};
}

function rotatePoint(point: Point, degrees: number): Point {
	const radians = degrees * Math.PI / 180;
	return {
		x: point.x * Math.cos(radians) - point.y * Math.sin(radians),
		y: point.x * Math.sin(radians) + point.y * Math.cos(radians)
	};
}

function normalizeDegrees(degrees: number): number {
	return ((degrees % 360) + 360) % 360;
}

function buildCanonicalHatPolygon(scale: number): Point[] {
	let x = 0;
	let y = 2 * height;
	const points: Point[] = [{ x, y }];

	canonicalHatEdges.forEach(edge => {
		x += edge.x * scale;
		y += edge.y * scale;
		points.push({ x, y });
	});

	return points;
}
