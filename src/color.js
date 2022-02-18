export const mod = (num, mod) => ((num % mod) + mod) % mod;

export function hexToRgba(colorString) {
    let rgbStr = colorString.slice(colorString.length - 6);
    let a = 1;

    if (rgbStr !== colorString)
        {
        let aStr = colorString.slice(0, 2);
        a = parseInt(aStr, 16) / 255;
        }

    let R = parseInt(rgbStr.slice(0, 2), 16);
    let G = parseInt(rgbStr.slice(2, 4), 16);
    let B = parseInt(rgbStr.slice(4), 16);

    return { r: R, g: G, b: B, a: a };
}

// expects {r: 0-255, g: 0-255, b: 0-255, a: 0-1} 
export function rgbaToHex(color) {
    let shorts = [
        color.r.toString(16),
        color.g.toString(16),
        color.b.toString(16),
        Math.round(color.a * 255).toString(16)
    ];
    return '#' + shorts.map(char => char.length === 1 ? `0${char}` : char).join('');
}

// expects {r: 0-255, g: 0-255, b: 0-255, a: 0-1} 
// returns "rgba(r, g, b, a)"
export function rgbaToString(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

// rgb, 0-255
export function rgbToHue(R, G, B) {
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

    return { h: hue, l: lightness, s: saturation }; 
}

// hue: 0-360, sat, light: 0-1
export function hslToRgb(hue, saturation, lightness) {
    const C = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const X = C * (1 - Math.abs(mod(hue / 60, 2) - 1));
    const norm = lightness - C * 0.5;

    const hueHist = hue / 60;
    let base = {R: 0, G: 0, B: 0};
    if (hueHist < 1)
        base = {R: C, G: X, B: 0};
    else if (hueHist < 2)
        base = {R: X, G: C, B: 0};
    else if (hueHist < 3)
        base = {R: 0, G: C, B: X};
    else if (hueHist < 4)
        base = {R: 0, G: X, B: C};
    else if (hueHist < 5)
        base = {R: X, G: 0, B: C};
    else if (hueHist < 6)
        base = {R: C, G: 0, B: X};

    let rgb = {};
    for (const key in base)
        rgb[key.toLowerCase()] = (base[key] + norm) * 255;

    return rgb;
}

// rgb, 0-255
export function rgbToHsv(R, G, B) {
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
    
    const saturation = (max == 0) ? 0 : (delta/max)

    return { h: hue, s: saturation, v: max }; 
}

// hue: 0-360, sat, value: 0-1
export function hsvToRgb(hue, saturation, value) {
    const C = value * saturation;
    const X = C * (1 - Math.abs(mod(hue / 60, 2) - 1));
    const norm = value - C;

    const hueHist = hue / 60;
    let base = {R: 0, G: 0, B: 0};
    if (hueHist < 1)
        base = {R: C, G: X, B: 0};
    else if (hueHist < 2)
        base = {R: X, G: C, B: 0};
    else if (hueHist < 3)
        base = {R: 0, G: C, B: X};
    else if (hueHist < 4)
        base = {R: 0, G: X, B: C};
    else if (hueHist < 5)
        base = {R: X, G: 0, B: C};
    else if (hueHist < 6)
        base = {R: C, G: 0, B: X};

    let rgb = {};
    for (const key in base)
        rgb[key.toLowerCase()] = Math.round((base[key] + norm) * 255);

    return rgb;
}

// expects object { r, g, b, a }
export function getRgbLed(color) {
    const hsv = rgbToHsv(color.r, color.g, color.b);
    // let brightness = color.a * hsv.v;
    // let ledRgb = hsvToRgb(hsv.h, hsv.s, 1);
    // ledRgb.a = brightness;
    const brightness = hsv.v * 0.5 + 0.5;
    const alpha = (1 - (1 - hsv.v)) * color.a;
    let ledRgb = hsvToRgb(hsv.h, hsv.s, brightness);
    ledRgb.a = alpha;
    return ledRgb;
}