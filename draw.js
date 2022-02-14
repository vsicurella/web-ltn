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

let colorFnc = (hexString) => rgbaToString(hexToRgba(hexString));

function refreshColor() {

    let keyElements = Array.from(document.getElementsByTagName('svg'));

    for (let key of keyElements) {
        if (!/key-\d{1,3}/.test(key.id))
            continue;

        const keyId = key.id;
        let keyNum = parseInt(keyId.split('-')[1]);
        let octaveIndex = Math.floor(keyNum / KEYSPEROCT);
        let keyIndex = keyNum % KEYSPEROCT;

        let keyData = mapping[octaveIndex][keyIndex];   
        let color = colorFnc(keyData.color);
        key.style.fill = color;
    }
}

function resetKeys() {
    console.log('reset canvas');
    // let canvas = document.getElementById("key-layout");
    // let ctx = canvas.getContext("2d");

    // ctx.fillStyle = "rgba(0, 0, 0, 0)";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ctx.globalCompositeOperation = "multiply";
    // ctx.fillStyle = "red";

    // setInterval(drawLayout, 1000);

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

    if (mapping)
        refreshColor();
}

