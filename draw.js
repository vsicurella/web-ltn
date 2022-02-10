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
    const hexCoords = getKeyboardHexCoords();

    const keyWidth = 10;
    const keyHeight = 10;

    // let keyBase = new Image();
    // keyBase.onload = (data) => {
    //     console.log(data);
    //     for (const board of hexCoords) {
    //         for (const key of board) {
    //             let x = key.x * 10 + 100;
    //             let y = key.y * 10 + 100;
    //             console.log(`x: ${x}, y: ${y}`);
    //             context.drawImage(keyBase, x, y, keyWidth, keyHeight);
    //         }
    //     }
    // }
    // keyBase.src = "./svg/key-outline.svg";

    const lateral = 10;
    const margin = 4;

    let keysParent = document.getElementById('keys');
    keysParent.innerHTML = '';

    let svg = document.getElementById('key-outline');

    const numBoards = Object.keys(mapping).filter(x => /\d+/.test(x)).length;

    for (let b = 0; b < numBoards; b++) {
        const board = mapping[b];
        const numKeys = Object.keys(board).length;
        for (let k = 0; k < numKeys; k++) {
            const keyData = board[k];
            const pos = hexCoords[b][k];

            const x = distanceStepsAwayX(lateral, margin, pos.x, pos.y);
            const y = distanceStepsAwayY(lateral, margin, pos.y);

            let newKey = svg.cloneNode(true);
            newKey.id = `key-${k + b*numKeys}`;

            newKey.style.position = 'relative';
            newKey.style.left = `${x}px`;
            newKey.style.top = `${y}px`;
            newKey.style.width = '10px';
            newKey.style.height = '10px';

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