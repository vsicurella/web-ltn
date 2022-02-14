const imageAspect = 2.498233;

let keyW = 0.0285;
let keyH = 0.0735;
let oct1Key1X = 0.0839425;
let oct1Key1Y = 0.3358
let oct1Key56X = 0.27333;
let oct1Key56Y = 0.83;
let oct5Key7X = 0.8785;
let oct5Key7Y = 0.3555;

let roundN = (n, value) => Math.round(value * (10 ** n)) / (10 ** n);

let colorFnc = (hexString) => rgbaToHex(hexToRgba(hexString));

function drawLayout(context) {
    // console.log('draw layout');

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
            const centre = centres[b][k];

            let newKey = svg.cloneNode(true);
            newKey.id = `key-${k + b*numKeys}`;

            newKey.style.position = 'inherit';
            newKey.style.left = `${roundN(2, centre.x)}px`;
            newKey.style.top = `${roundN(2, centre.y)}px`;
            newKey.style.width = `${roundN(1, keyWidth)}px`;
            newKey.style.height = `${roundN(1, keyHeight)}px`;

            let color = `#${colorFnc(keyData.color)}`;
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

    // setInterval(drawLayout, 1000);
    drawLayout();
}

