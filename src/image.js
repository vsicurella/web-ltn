import { Board, LumatoneBaseImage } from "./hex";

import { fabric } from "fabric";
import { rgbaToString, hexToRgba, getRgbLed } from "./color.js";

export class ImageToLtnConverter {

    fileData = null;
    currentImage = new Image();

    samplePoints = [];
    dotGroup = null;
    hexGroup = null;

    sampleW = 0;
    sampleH = 0;

    constructor(canvasId, width, height) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;

        this.canvas = new fabric.Canvas(canvasId, { width: this.width, height: this.height, preserveObjectStacking: true });

        fabric.Image.fromURL(require("../png/keyboard-base-1x.png"), (img) => {
            this.backgroundImage = img;
            this.backgroundImage.scaleToHeight(this.height)
            this.resetCanvas();

            this.board = new Board(0, 5);

            const imgWidth = this.backgroundImage.width * this.backgroundImage.scaleX;
            const imgHeight = this.backgroundImage.height * this.backgroundImage.scaleY;
            LumatoneBaseImage.setBoardBasis(this.board, imgWidth, height, 0, 0);

            this.sampleW = imgWidth * LumatoneBaseImage.keyW * 0.5;
            this.sampleH = imgHeight * LumatoneBaseImage.keyH * 0.5;
    
            this.resetSamplePoints();
            this.addHexGuides();
        });
    }

    resetSamplePoints() {
        this.samplePoints = [];

        let dots = [];
        let hexes = [];

        const rotation = 0.28;

        let hexPoints = [];
        for (var i = 0; i < 6; i++) {
            const theta = 2 * Math.PI / 6 * i + rotation;
            hexPoints.push({ 
                x: Math.cos(theta) * this.sampleW,
                y: Math.sin(theta) * this.sampleH 
            });
        }

        const octaveCentres = this.board.getCentres();
        for (const oct in octaveCentres) {
            for (const key in octaveCentres[oct]) {
                const point = octaveCentres[oct][key];
                this.samplePoints.push(point);

                const dotRadius = 1;
                const dot = new fabric.Circle({
                    radius: dotRadius,
                    fill: 'red',
                    left: point.x - dotRadius,
                    top: point.y - dotRadius
                });

                dots.push(dot);

                    
                const hexCoords = hexPoints.map((hp) => new Object({ x: hp.x + point.x, y: hp.y + point.y }));
                console.log(hexCoords);

                const hex = new fabric.Polygon(hexCoords, {
                    stroke: 'red',
                    fill: 'transparent'
                });

                hexes.push(hex);
            }
        }

        const groupOptions = { 
            evented: false,
            selectable: false
         };

        this.dotGroup = new fabric.Group(dots, groupOptions);
        this.hexGroup = new fabric.Group(hexes, groupOptions);
        
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
        this.canvas.add(this.dotGroup);
        this.canvas.add(this.hexGroup);
    }
}
