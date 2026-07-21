export interface DayLayout {
	centerX: number;
	centerY: number;
	radius: number;
	timeY: number;
	timeFontSize: number;
}

export interface LifeGridLayout {
	cols: number;
	rows: number;
	cellSize: number;
	gap: number;
	gridWidth: number;
	gridHeight: number;
	startX: number;
	startY: number;
	statsY: number;
}

export function calculateDayLayout(width: number, height: number): DayLayout {
	const shortSide = Math.min(width, height);
	const radius = shortSide * 0.28;
	const centerY = height * 0.44;
	const timeFontSize = shortSide / 14;

	return {
		centerX: width / 2,
		centerY,
		radius,
		timeY: centerY + radius + shortSide * 0.07,
		timeFontSize,
	};
}

export function calculateLifeGrid(width: number, height: number, totalCells: number): LifeGridLayout {
	const cols = 52;
	const rows = Math.max(1, Math.ceil(totalCells / cols));
	const gapRatio = 0.2;
	const horizontalPadding = width * 0.06;
	const gridTop = height * 0.06;
	const gridBottom = height * 0.86;
	const availableWidth = width - horizontalPadding * 2;
	const availableHeight = gridBottom - gridTop;
	const widthUnits = cols + (cols - 1) * gapRatio;
	const heightUnits = rows + (rows - 1) * gapRatio;
	const cellSize = Math.min(availableWidth / widthUnits, availableHeight / heightUnits);
	const gap = cellSize * gapRatio;
	const gridWidth = cols * cellSize + (cols - 1) * gap;
	const gridHeight = rows * cellSize + (rows - 1) * gap;

	return {
		cols,
		rows,
		cellSize,
		gap,
		gridWidth,
		gridHeight,
		startX: (width - gridWidth) / 2,
		startY: gridTop + (availableHeight - gridHeight) / 2,
		statsY: height * 0.93,
	};
}
