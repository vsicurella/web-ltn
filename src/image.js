import { Board, boardGeometry, calculateCentres, LATERALRADIUSRATIO, LumatoneBaseImage } from "./hex";

import { fabric } from "fabric";
import { rgbaToString, hexToRgba, getRgbLed } from "./color.js";

export class ImageToLtnConverter {

    fileData = null;
    currentImage = new Image();

    samplePoints = [];

    constructor(canvasId, width, height) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;

        this.canvas = new fabric.Canvas(canvasId, { width: this.width, height: this.height });

        fabric.Image.fromURL(require("../png/keyboard-base-1x.png"), (img) => {
            this.backgroundImage = img;
            this.backgroundImage.scaleToHeight(this.height)
            this.resetCanvas();
        });

        this.board = new Board(0, 5);
        LumatoneBaseImage.setBoardBasis(this.board);

        this.addHexGuides();

        console.log(this.board);
    }

    resetCanvas() {
        console.log('ImageToLtnConverter.resetCanvas')

        this.canvas.clear();
        this.canvas.setBackgroundImage(this.backgroundImage);
    }

    setImageFile(fileData) {
        console.log('convertImageToLtn()');
        this.fileData = fileData;

        this.resetCanvas();
    
        let file = new FileReader();
        file.onload = (fileData) => {
            if (fileData == null)
                throw new Error("unable to read file");
    
            let img = new Image();
            img.src = fileData.target.result;
            img.onload = () => {
                this.currentImage = new fabric.Image(img);
                this.canvas.add(this.currentImage);
                this.currentImage.on('modified', (event) => console.log(event))

                this.addHexGuides();
            };

        };
    
        file.readAsDataURL(this.fileData);
    }

    addHexGuides() {
        const dotRadius = 8;
        const octaveCentres = this.board.getCentres();
        for (const oct in octaveCentres) {
            const centres = octaveCentres[oct];
            for (const key in centres) {
                const p = centres[key];
                let dot = new fabric.Circle({
                    radius: dotRadius,
                    fill: 'black',
                    left: p.x - dotRadius,
                    top: p.y - dotRadius
                });
                this.canvas.add(dot);
            }
        }
    }

    parseTransform() {

    }
}
