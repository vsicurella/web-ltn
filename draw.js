const imageAspect = 2.498233;
const imageY      = 1.0 / 7.0;

const keybedX = 0.06908748;

const keyW = 0.027352;
const keyH = 0.07307;

const oct1Key1X = 0.0839425;
const oct1Key1Y = 0.335887;

const oct1Key56X = 0.27304881;
const oct1Key56Y = 0.8314673;

const oct5Key7X = 0.878802;
const oct5Key7Y = 0.356511491;

const LumatoneColumnAngle = -0.30404;
const LumatoneRowAngle = 0.809175;

let mod = (num, mod) => ((num % mod) + mod) % mod;

function rgbToHue(rgb) {
    let R = parseInt(rgb.slice(0, 2), 16);
    let G = parseInt(rgb.slice(2, 4), 16);
    let B = parseInt(rgb.slice(4, 6), 16);

    let r = R/255.0;
    let g = G/255.0;
    let b = B/255.0;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let hue = 0;
    let delta = max - min;

    if (max === r)
        hue = 60 * mod(((g-b)/ delta), 6);
    else if (max === g)
        hue = 60 * (((b - r) / delta) + 2);
    else if (max === b)
        hue = 60 * (((r - g) / delta) + 4);
    
    
    let lightness = (max + min) * 0.5;
    let saturation = (delta == 0) ? 0 : (delta / ( 1 - Math.abs(2 * lightness - 1)));

    return { h: Math.round(hue), l: Math.round(lightness * 100), s: Math.round(saturation * 100) }; 
}

function drawLayout(context) {
    console.log('draw layout');

    const displayElement = document.getElementById("keyboard-base");
    const width = displayElement.clientWidth;
    const height = displayElement.clientHeight;

    const graphicHeight = height;
	const graphicWidth = imageAspect * graphicHeight;

	const lumatoneBounds = {
        x: (width - graphicWidth) * 0.5,
        y: 0,
        w: graphicWidth,
        h: graphicHeight
    };

    let keyWidth = graphicWidth * keyW;
    let keyHeight = graphicHeight * keyH;

    const oct1Key1  = { x: oct1Key1X * graphicWidth + lumatoneBounds.x,   y: oct1Key1Y * graphicHeight + lumatoneBounds.y };
	const oct1Key56 = { x: oct1Key56X * graphicWidth + lumatoneBounds.x,  y: oct1Key56Y * graphicHeight + lumatoneBounds.y };
	const oct5Key7  = { x: oct5Key7X * graphicWidth + lumatoneBounds.x,   y: oct5Key7Y * graphicHeight + lumatoneBounds.y };

    const basis = getSkewBasis(oct1Key1, oct1Key56, 10, oct5Key7, 24);
    const centres = calculateCentres(0, 5, basis);

    const numBoards = Object.keys(mapping).filter(x => /\d+/.test(x)).length;

    let keysParent = document.getElementById('keys');
    keysParent.innerHTML = '';
    let svg = document.getElementById('key-outline');

    for (let b = 0; b < numBoards; b++) {
        const board = mapping[b];
        const numKeys = Object.keys(board).length;
        for (let k = 0; k < numKeys; k++) {
            const keyData = board[k];
            //const pos = hexCoords[b][k];

            const centre = centres[b][k];

            let newKey = svg.cloneNode(true);
            newKey.id = `key-${k + b*numKeys}`;

            newKey.style.position = 'inherit';
            newKey.style.left = `${centre.x}px`;
            newKey.style.top = `${centre.y}px`;
            newKey.style.width = `${Math.round(keyWidth)}px`;
            newKey.style.height = `${Math.round(keyHeight)}px`;

            let color = `#${keyData.color.slice(2)}`;
            newKey.style.fill = color;
            keysParent.appendChild(newKey);
        }
    }
}

function resetCanvas() {
    console.log('reset canvas');
    // let canvas = document.getElementById("key-layout");
    // let ctx = canvas.getContext("2d");

    // ctx.fillStyle = "rgba(0, 0, 0, 0)";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ctx.globalCompositeOperation = "multiply";
    // ctx.fillStyle = "red";

    drawLayout();
}