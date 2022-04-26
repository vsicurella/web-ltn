export const LATERALRADIUSRATIO = 0.8660254037844;
const BOARDROWOFFSET = 2;

export class BoardGeometry {
	static horizontalLines = [
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
    ];

	static verticalLines = [
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
    ];

    static firstColumnOffsets = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4 ];
    static rowOffsets = [ -4, -3, -3, -2, -2, -1, -1, 0, 0, 2, 5 ];
    static boardXOffset = 7;
    static boardYOffset = -2;

	static boardKeyToHexPosition(boardNum, keyNum) {
		for (let lineIx = 0; lineIx < this.horizontalLines.length; lineIx++) {
			let rowIx = this.horizontalLines[lineIx].indexOf(keyNum);
			if (rowIx != -1)
				return { 
					x: this.boardXOffset * boardNum + rowIx + this.rowOffsets[lineIx], 
					y: this.boardYOffset * boardNum - lineIx 
				};
		}
	};

	static getKeyboardHexCoords() {
		let coords = [];
		for (let board = 0; board < 5; board++) {
			let boardCoords = [];
			coords.push(boardCoords);
			for (let key = 0; key < 56; key++)
				boardCoords.push(this.boardKeyToHexPosition(board, key));
		}
		return coords;
	}

	static distanceStepsAwayX(lateral, margin, stepsX, stepsY) {
		return stepsX * (2 * lateral + margin) + ((stepsY + 1) / 2) * (lateral + margin / 2.0);
	}

	static distanceStepsAwayY(radius, margin, stepsY) {
		return stepsY * (radius * 1.5 + margin * LATERALRADIUSRATIO);
	}

	static verticalToSlantOffset(rowNum, offsetIn) {
		return offsetIn -  Math.floor((rowNum * 0.5));
	}

	static maxHorizontalLength() {
		return this.horizontalLines.reduce((max, line) => line.length > max ? line.length : max, 0);
	}
}

export class Board {
	basis = {
		column: {
			x: 0.5,
			y: 0.5,
		},
		row: {
			x: 0.5,
			y: 0.5
		}
	};

	startingCentre = { x: 0, y: 0 };

	centres = null;

	horizontalScalar = 1.0;
	verticalScalar = 1.0;

	constructor(startingOctave, numOctaves, basis) {
		this.startingOctave = startingOctave;
		this.numOctaves = numOctaves;

		if (basis != null) {
			this.setBasis(basis);
		}
	}

	setBasis(newBasis) {
		if (newBasis.column == null || newBasis.row == null)
			return;

		if (newBasis.column.x == null || newBasis.column.y == null)
			return;

		if (newBasis.row.x == null || newBasis.row.y == null)
			return;

		this.basis = {
			column: {
				x: newBasis.column.x,
				y: newBasis.column.y,
			},
			row: {
				x: newBasis.row.x,
				y: newBasis.row.y
			}
		}
	}

	setBasisFromPoints(firstKeyCentrePoint, secondKeyCentrePoint, rowStepsFirstToSecond, thirdKeyCentrePoint, colStepsSecondToThird) {	
	
		this.centres = null;

		this.startingCentre = firstKeyCentrePoint;
	
		const secondKeyNormFirst = { x: secondKeyCentrePoint.x - this.startingCentre.x, y: secondKeyCentrePoint.y - this.startingCentre.y };
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

		this.setBasis(basis);
		return basis;
	}

	getCentres() {
		if (this.centres != null)
			return this.centres;

		this.centres = {};

		const numColumnsInOctave = BoardGeometry.maxHorizontalLength();
		const numRowsInOctave	 = BoardGeometry.horizontalLines.length;

		const totalOctaves = Math.abs(this.numOctaves - this.startingOctave);
		const maxColumnLength = numRowsInOctave;

		const colX = this.basis.column.x * this.horizontalScalar;
		const colY = this.basis.column.y * this.horizontalScalar;
		const rowX = this.basis.row.x    * this.verticalScalar;
		const rowY = this.basis.row.y    * this.verticalScalar;

		let octaveColumnOffset = this.startingOctave * numColumnsInOctave;
		let octaveRowOffset = this.startingOctave * BOARDROWOFFSET;
		
		for (let octaveIndex = this.startingOctave; octaveIndex < this.startingOctave + this.numOctaves; octaveIndex++) {
			this.centres[octaveIndex] = {};
			let octaveCentres = this.centres[octaveIndex];
			let keyIndex = 0;

			for (let row = 0; row < maxColumnLength; row++) {
				const colStart = BoardGeometry.verticalToSlantOffset(row, BoardGeometry.firstColumnOffsets[row]) + octaveColumnOffset;
				const colEnd = colStart + BoardGeometry.horizontalLines[row]?.length || 0;

				let octaveRow = row + octaveRowOffset;

				for (let col = colStart; col < colEnd; col++) {
					let centre = {
						x: this.startingCentre.x + col * colX + octaveRow * rowX,
						y: this.startingCentre.y + col * colY + octaveRow * rowY
					};
					// centre.applyTransform(transform);
					octaveCentres[keyIndex] = centre;
					keyIndex++;
				}
			}

			octaveColumnOffset += (numColumnsInOctave - 1);
			octaveRowOffset += BOARDROWOFFSET;
		}

	return this.centres;
	}
}

export class LumatoneBaseImage {
	static imageAspect = 2.498233;
	static keyW = 0.0285;
	static keyH = 0.0735;
	static oct1Key1X = 0.0839425;
	static oct1Key1Y = 0.3358
	static oct1Key56X = 0.27333;
	static oct1Key56Y = 0.83;
	static oct5Key7X = 0.8785;
	static oct5Key7Y = 0.3555;

	static stepsBetweenFirstAndSecond = 10;
	static stepsBetweenSecondAndThird = 24;

	static setBoardBasis(board, width, height, imgX, imgY) {
		return board.setBasisFromPoints(
			{ x: this.oct1Key1X * width + imgX, y: this.oct1Key1Y * height + imgY },
			{ x: this.oct1Key56X * width + imgX, y: this.oct1Key56Y * height + imgY }, this.stepsBetweenFirstAndSecond,
			{ x: this.oct5Key7X * width + imgX, y: this.oct5Key7Y * height + imgY }, this.stepsBetweenSecondAndThird,
		)
	}
}
