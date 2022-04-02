import { getSkewBasis, calculateCentres, LATERALRADIUSRATIO } from "./hex.js"
import { NUMOCTAVES, KEYSPEROCT, currentLtn } from "./ltn.js";
import { rgbaToString, hexToRgba } from "./color.js";
// import { Canvg } from "canvg";
import pica, { Pica } from "pica";
import Canvg from "canvg";

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

let colorFnc = (hexString) => rgbaToString(hexToRgba(hexString));

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
    }
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

    const oct1Key1  = { x: oct1Key1X * graphicWidth + lumatoneBounds.x,   y: oct1Key1Y * graphicHeight + lumatoneBounds.y };
	const oct1Key56 = { x: oct1Key56X * graphicWidth + lumatoneBounds.x,  y: oct1Key56Y * graphicHeight + lumatoneBounds.y };
	const oct5Key7  = { x: oct5Key7X * graphicWidth + lumatoneBounds.x,   y: oct5Key7Y * graphicHeight + lumatoneBounds.y };

    const basis = getSkewBasis(oct1Key1, oct1Key56, 10, oct5Key7, 24);
    centres = calculateCentres(0, 5, basis);
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
            newKey.id = `key-${k + b * KEYSPEROCT}`;

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
let shadingBlendMode = "normal";
export function renderToCanvas() {
    console.log('rendering canvas');
    let canvas = document.getElementById("keyboard-render");

    let ctx = canvas.getContext("2d");

    let baseImg, shadingImage, keyOutline;
    let draw = () => {
        canvas.width = graphicWidth;
        canvas.height = graphicHeight;

        const scaleW = graphicWidth / baseImg.naturalWidth;
        const scaleH = graphicHeight / baseImg.naturalHeight;

        // const kw = keyAsset.width / keyWidth;
        // const kh = keyAsset.height / keyHeight;
        // ctx.drawImage(baseImg, 0, 0, graphicWidth, graphicHeight);

        const pica = require('pica')();
        pica.resize(baseImg, canvas).then(() => {
            const mapping = currentLtn.data;
            if (mapping) {
                console.log('drawing canvas keys');
                // render keys
                ctx.globalCompositeOperation = keyBlendMode;

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

                        centre.x -= (keyWidth * LATERALRADIUSRATIO) * 17.9;
                        centre.y -= keyHeight * 0.48;

                        // console.log(`b: ${b}, k: ${k} = ${JSON.stringify(centre)}`);

                        Canvg.from(ctx, keyAsset, { ignoreClear: true, ignoreDimensions: true })
                        .then((keysvg) => {
                            let color = colorFnc(keyData.color);
                            color.a = 0.88;
                            ctx.fillStyle = color;

                            keysvg.resize(keyWidth, keyHeight);
                            keysvg.render({ offsetX: centre.x, offsetY: centre.y }); 
                        });
                    }
                }
            

                ctx.globalCompositeOperation = shadingBlendMode;
                // ctx.drawImage(shadingImage, 0, 0, graphicWidth, graphicHeight);
                pica.resize(shadingImage, canvas);
            }
        });
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
