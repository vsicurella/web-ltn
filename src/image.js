import { boardGeometry, calculateCentres, LATERALRADIUSRATIO } from "./hex";

import { fabric } from "fabric";
import { rgbaToString, hexToRgba, getRgbLed } from "./color.js";

export class ImageToLtnConverter {

    fileData = null;
    currentImage = new Image();

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
    }

    resetCanvas() {
        console.log('ImageToLtnConverter.resetCanvas')

        this.canvas.clear();
        this.canvas.setBackgroundImage(this.backgroundImage);
    }

    setImageFile(fileData) {
        console.log('convertImageToLtn()');
        this.fileData = fileData;
    
        let file = new FileReader();
        file.onload = (fileData) => {
            if (fileData == null)
                throw new Error("unable to read file");
    
            this.currentImage.src = fileData.target.result;
            this.currentImage.onload = () => {
                this.canvas.add(new fabric.Image(this.currentImage));
            };
        };
    
        file.readAsDataURL(this.fileData);
    }

    
}
