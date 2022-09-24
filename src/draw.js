import { getSkewBasis, calculateCentres, LATERALRADIUSRATIO, Board, LumatoneBaseImage } from "./hex.js"
import { NUMOCTAVES, KEYSPEROCT, currentLtn } from "./ltn.js";
import { rgbaToString, hexToRgba, getRgbLed } from "./color.js";

import { toPng } from 'html-to-image';

import { fabric } from "fabric";

const imageAspect = 2.498233;

// "Constants" (not const for tweaking purposes)
let keyW = 0.0285;
let keyH = 0.0735;
let oct1Key1X = 0.0839425;
let oct1Key1Y = 0.3358
let oct1Key56X = 0.27333;
let oct1Key56Y = 0.83;
let oct5Key7X = 0.8785;
let oct5Key7Y = 0.3555;

// Calculated layout properties
let graphicWidth = 0;
let graphicHeight = 0;
let keyWidth = 0;
let keyHeight = 0;
let centres = {};

const roundN = (n, value) => Math.round(value * (10 ** n)) / (10 ** n);

// let colorFnc = (hexString) => rgbaToString(hexToRgba(hexString));
let colorFnc = (hexString) => rgbaToString(getRgbLed(hexToRgba(hexString)));

let board = new Board(0, 5);

export function refreshColor() {

    let keyElements = Array.from(document.getElementsByTagName('svg'));

    for (let key of keyElements) {
        if (!/key-\d{1,3}/.test(key.id))
            continue;

        const keyId = key.id;
        let keyNum = parseInt(keyId.split('-')[1]);
        let octaveIndex = Math.floor(keyNum / KEYSPEROCT);
        let keyIndex = keyNum % KEYSPEROCT;

        const mapping = currentLtn.data;
        let keyData = mapping[octaveIndex][keyIndex];   
        let color = colorFnc(keyData.color);
        key.style.fill = color;
        key.style.mixBlendMode = 'dist';
        key.style.opacity = 0.88;

        const tooltipId = `${keyId}-tooltip`;
        let previousTooltip = key.getElementById(tooltipId);
        if (previousTooltip)
            key.removeChild(previousTooltip);

        let tooltipcontainer = document.createElement('div');
        tooltipcontainer.id = tooltipId;
        tooltipcontainer.classList.add('tooltip');
        let tooltip = document.createElement('span');
        tooltip.innerText = `${key.id} Ch ${keyData.channel}, Note ${keyData.note}`;
        tooltip.classList.add('tooltiptext');

        tooltipcontainer.appendChild(tooltip);
        key.appendChild(tooltipcontainer);
    }

    // render html as image
    let display = document.getElementById('display');
    toPng(display).then((url) => {
        let imgdiv = document.getElementById('display-image');
        imgdiv.innerHTML = '';
        let img = new Image();
        img.src = url;
        imgdiv.appendChild(img);
    })
}

export function resetCentres() {
    const displayElement = document.getElementById("keyboard-base");
    const width = displayElement.clientWidth;
    const height = displayElement.clientHeight;

    graphicHeight = height;
	graphicWidth = Math.round(imageAspect * graphicHeight);

    keyWidth = graphicWidth * keyW;
    keyHeight = graphicHeight * keyH;

	const lumatoneBounds = {
        x: (width - graphicWidth) * 0.5,
        y: 0,
        w: graphicWidth,
        h: graphicHeight
    };

    LumatoneBaseImage.setBoardBasis(board, graphicWidth, graphicHeight, lumatoneBounds.x, lumatoneBounds.y);
    centres = board.getCentres();
}

export function resetKeys() {
    console.log('reset keys');

    resetCentres();

    let keysParent = document.getElementById('keys');
    keysParent.innerHTML = '';
    let svg = document.getElementById('key-outline');

    for (let b = 0; b < NUMOCTAVES; b++) {
        for (let k = 0; k < KEYSPEROCT; k++) {
            const centre = centres[b][k];
            if (centre == undefined) {
                console.log(`board ${b} key ${k} position is undefined`);
                continue;
            }

            let newKey = svg.cloneNode(true);

            const keyNum = `key-${k + b * KEYSPEROCT}`;
            newKey.id = keyNum;

            newKey.style.position = 'inherit';
            newKey.style.left = `${roundN(2, centre.x)}px`;
            newKey.style.top = `${roundN(2, centre.y)}px`;
            newKey.style.width = `${roundN(1, keyWidth)}px`;
            newKey.style.height = `${roundN(1, keyHeight)}px`;

            newKey.style.fill = 'rgba(0, 0, 0, 0)';

            keysParent.appendChild(newKey);
        }
    }

    if (currentLtn.data)
        refreshColor();
}

let keyBlendMode = "overlay";
let shadingBlendMode = "difference";
export function renderToCanvas() {
    console.log('rendering canvas');

    let canvas = new fabric.StaticCanvas('keyboard-render', { width: graphicWidth, height: graphicHeight });
    canvas.clear();

    let baseImg, shadingImage, keyOutline;
    let draw = () => {
        const scaleW = graphicWidth / baseImg.naturalWidth;
        const scaleH = graphicHeight / baseImg.naturalHeight;

        const graphicResize = new fabric.Image.filters.Resize({ scaleX: scaleW, scaleY: scaleH });
        let fbBase = new fabric.Image(baseImg);
        fbBase.applyFilters([graphicResize]);
        canvas.add(fbBase);

        let svgEl = document.getElementById('key-outline');
        let svgText = svgEl.outerHTML.split('\n').map(line => line.trim()).join('');
        fabric.loadSVGFromString(svgText, (objects, options) => {
            let temp = objects[0];
            // temp.set({ width: keyWidth, height: keyHeight })
            temp.scaleToWidth(keyWidth, true);
            temp.scaleToHeight(keyHeight, true);
            temp.globalCompositeOperation = keyBlendMode;

            const mapping = currentLtn.data;
            if (mapping) {
                console.log('drawing canvas keys');
                // render keys
                for (let b = 0; b < NUMOCTAVES; b++) {
                    for (let k = 0; k < KEYSPEROCT; k++) {
                        let centre = centres[b][k];
                        if (centre == undefined) {
                            console.log(`board ${b} key ${k} position is undefined`);
                            continue;
                        }

                        let keyData = mapping[b][k];
                        if (keyData == undefined) {
                            console.log(`board ${b} key ${k} data is undefined`);
                        }

                        temp.clone((newKey) => {
                            // todo fix
                            let x = centre.x - (keyWidth * LATERALRADIUSRATIO) * 17.9;
                            // centre.x -= graphicWidth * 0.5
                            let y = centre.y - keyHeight * 0.48;

                            // console.log(`b: ${b}, k: ${k} = ${JSON.stringify(centre)}`);

                            newKey.setPositionByOrigin(new fabric.Point(x, y), 'left', 'top');
    
                            let color = colorFnc(keyData.color);
                            // console.log(color)
                            newKey.fill =  '#' + (new fabric.Color(color)).toHexa();
                            canvas.add(newKey);
                        })                        
                    }
                }
            }
        });
        
        let fbShadows = new fabric.Image(shadingImage);
        fbShadows.globalCompositeOperation = shadingBlendMode;
        fbShadows.applyFilters([graphicResize]);
        canvas.add(fbShadows);
    };

    baseImg = new Image(graphicWidth, graphicHeight);
    shadingImage = new Image(graphicWidth, graphicHeight);
    keyOutline = new Image(keyWidth, keyHeight);
    // keyOutline = document.getElementById("key-outline");

    const baseAsset = require('../png/keyboard-base-1x.png');
    const shadingAsset = require( "../png/keyboard-shading-1x.png");
    // const keyAsset = require("../png/key-shape.png");
    const keyAsset = require("../svg/key-outline.svg");
    
    baseImg.src = baseAsset;
    baseImg.onload = () => {
        shadingImage.src = shadingAsset;
        shadingImage.onload = () => {
            keyOutline.src = keyAsset;
            
            keyOutline.onload = draw;
        }
    }
}

export function setKeyBlendMode(mode) {
    keyBlendMode = mode;
    renderToCanvas();
}

export function setShadingBlendMode(mode) {
    shadingBlendMode = mode;
    renderToCanvas();
}