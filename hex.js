const LATERALRADIUSRATIO = 0.8660254037844;

const boardGeometry =
{
    horizontalLines: [
        [ 0, 1 ],
        [ 2, 3, 4, 5, 6 ],
        [ 7, 8, 9, 10, 11, 12 ],
        [ 13, 14, 15, 16, 17, 18 ],
        [ 19, 20, 21, 22, 23, 24 ],
        [ 25, 26, 27, 28, 29, 30 ],
        [ 31, 32, 33, 34, 35, 36 ],
        [ 37, 38, 39, 40, 41, 42 ],
        [ 43, 44, 45, 46, 47, 48 ],
        [ 49, 50, 51, 52, 53 ],
        [ 54, 55 ]
    ],

    verticalLines: [
        [ 0 ],
        [ 7, 2, 1 ],
        [ 19, 13, 8, 3 ],
        [ 31, 25, 20, 14, 9, 4 ],
        [ 43, 37, 32, 26, 21, 15, 10, 5 ],
        [ 44, 38, 33, 27, 22, 16, 11, 6 ],
        [ 49, 45, 39, 34, 28, 23, 17, 12 ],
        [ 50, 46, 40, 35, 29, 24, 18 ],
        [ 51, 47, 41, 36, 30 ],
        [ 54, 52, 48, 42 ],
        [ 55, 53 ],
    ],

    firstColumnOffsets: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4 ],
    rowOffsets: [ -4, -3, -3, -2, -2, -1, -1, 0, 0, 2, 5 ],
    boardXOffset: 7,
    boardYOffset: -2,
};
boardGeometry.maxHorizontalLength = boardGeometry.horizontalLines.reduce((max, line) => line.length > max ? line.length : max, 0);

function boardKeyToHexPosition(boardNum, keyNum) {
    for (let lineIx = 0; lineIx < boardGeometry.horizontalLines.length; lineIx++) {
		let rowIx = boardGeometry.horizontalLines[lineIx].indexOf(keyNum);
		if (rowIx != -1)
			return { 
                x: boardGeometry.boardXOffset * boardNum + rowIx + boardGeometry.rowOffsets[lineIx], 
                y: boardGeometry.boardYOffset * boardNum - lineIx 
            };
	}
}

function getKeyboardHexCoords() {
	let coords = [];
	for (let board = 0; board < 5; board++) {
		let boardCoords = [];
		coords.push(boardCoords);
		for (let key = 0; key < 56; key++)
			boardCoords.push(boardKeyToHexPosition(board, key));
	}
	return coords;
}

function distanceStepsAwayX(lateral, margin, stepsX, stepsY) {
	return stepsX * (2 * lateral + margin) + ((stepsY + 1) / 2) * (lateral + margin / 2.0);
}

function distanceStepsAwayY(radius, margin, stepsY) {
	return stepsY * (radius * 1.5 + margin * LATERALRADIUSRATIO);
}

function calculateCentres(startingOctave, numOctaves) {
	let centres = [];

	const numColumnsInOctave = boardGeometry.maxHorizontalLength;
	const numRowsInOctave	 = boardGeometry.horizontalLines.length;

	const totalOctaves = Math.abs(numOctaves - startingOctave);
	const maxRowLength = totalOctaves * numColumnsInOctave;
	const maxColumnLength = numRowsInOctave + BOARDROWOFFSET * (totalOctaves - 1);

	const rad = radius * verticalScalar;
	const lat = radius * LATERALRADIUSRATIO * horizontalScalar;

	let octaveColumnOffset = startingOctave * numColumnsInOctave;
	let octaveRowOffset = startingOctave * BOARDROWOFFSET;

	const yUnit = distanceStepsAwayY(rad, margin, 1);
	
	let yCoordinate = startingCentre.y;

	for (let octaveIndex = startingOctave; octaveIndex < startingOctave + numOctaves; octaveIndex++) {
		for (let row = 0; row < maxColumnLength; row++) {
			let rowCount = boardGeometry.horizontalLines[row].length;
			let firstColumn = boardGeometry.firstColumnOffset(row) + octaveColumnOffset;

			let octaveRow = row + octaveRowOffset;

			for (let col = 0; col < rowCount; col++) {
				let centre = {
					// TODO: review implementation. this curently treats rows as zigzag 
					x: startingCentre.x + distanceStepsAwayX(lat, margin, firstColumn + col, (octaveRow % 2)),
					y: yCoordinate
                };
				centre.applyTransform(transform);
				hexagonCentres.add(centre);
			}

			yCoordinate += yUnit;
		}

		octaveColumnOffset += numColumnsInOctave;
		octaveRowOffset += BOARDROWOFFSET;
		yCoordinate = startingCentre.y + distanceStepsAwayY(rad, margin, octaveRowOffset);
	}

	return hexagonCentres;
}
