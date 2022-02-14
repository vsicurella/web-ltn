const LATERALRADIUSRATIO = 0.8660254037844;
const BOARDROWOFFSET = 2;

let horizontalScalar = 1.0;
let verticalScalar = 1.0;

let startingCentre = { x: 0, y: 0 };

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

function verticalToSlantOffset(rowNum, offsetIn) {
	return offsetIn -  Math.floor((rowNum * 0.5));
}


// TODO Turn into a class

function calculateCentres(startingOctave, numOctaves, basis = { column: { x: 0.5, y: 0.5 }, row: { x: 0.5, y: 0.5 } }) {
	let centres = {};

	const numColumnsInOctave = boardGeometry.maxHorizontalLength;
	const numRowsInOctave	 = boardGeometry.horizontalLines.length;

	const totalOctaves = Math.abs(numOctaves - startingOctave);
	const maxColumnLength = numRowsInOctave + BOARDROWOFFSET * (totalOctaves - 1);

	const colX = basis.column.x * horizontalScalar;
	const colY = basis.column.y * horizontalScalar;
	const rowX = basis.row.x    * verticalScalar;
	const rowY = basis.row.y    * verticalScalar;

	let octaveColumnOffset = startingOctave * numColumnsInOctave;
	let octaveRowOffset = startingOctave * BOARDROWOFFSET;
	
	for (let octaveIndex = startingOctave; octaveIndex < startingOctave + numOctaves; octaveIndex++) {

		centres[octaveIndex] = {};
		let octaveCentres = centres[octaveIndex];
		let keyIndex = 0;

		for (let row = 0; row < maxColumnLength; row++) {
			const colStart = verticalToSlantOffset(row, boardGeometry.firstColumnOffsets[row]) + octaveColumnOffset;
			const colEnd = colStart + boardGeometry.horizontalLines[row]?.length || 0;

			let octaveRow = row + octaveRowOffset;

			for (let col = colStart; col < colEnd; col++) {

				let centre = {
					x: startingCentre.x + col * colX + octaveRow * rowX,
					y: startingCentre.y + col * colY + octaveRow * rowY
                };
				// centre.applyTransform(transform);
				octaveCentres[keyIndex] = centre;
				keyIndex++;
			}
		}

		octaveColumnOffset += (numColumnsInOctave - 1);
		octaveRowOffset += BOARDROWOFFSET;
	}

	return centres;
}

function getSkewBasis(firstKeyCentrePoint, secondKeyCentrePoint, rowStepsFirstToSecond, thirdKeyCentrePoint, colStepsSecondToThird) {	
	
	startingCentre = firstKeyCentrePoint;

	const secondKeyNormFirst = { x: secondKeyCentrePoint.x - startingCentre.x, y: secondKeyCentrePoint.y - startingCentre.y };
	const thirdKeyNormSecond = { x: thirdKeyCentrePoint.x - secondKeyCentrePoint.x, y: thirdKeyCentrePoint.y - secondKeyCentrePoint.y }

	const columnAngle = Math.atan((thirdKeyCentrePoint.y - secondKeyCentrePoint.y) / (thirdKeyCentrePoint.x - secondKeyCentrePoint.x));
	const rowAngle = Math.atan(secondKeyNormFirst.y / secondKeyNormFirst.x);

	const columnAngleCos = Math.cos(columnAngle);
	const columnAngleSin = Math.sin(columnAngle);
	const rowAngleCos = Math.cos(rowAngle);
	const rowAngleSin = Math.sin(rowAngle);

	const colUnit = thirdKeyNormSecond.x / (colStepsSecondToThird * columnAngleCos);
	const rowUnit = secondKeyNormFirst.y / (rowStepsFirstToSecond * rowAngleSin);

	const basis = {
		column: { x: colUnit * columnAngleCos, y: colUnit * columnAngleSin },
		row:	{ x: rowUnit * rowAngleCos,    y: rowUnit * rowAngleSin }
	}; 

	return basis;
}
