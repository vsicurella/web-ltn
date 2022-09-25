import { INTERPOLATION, interpolate } from './interpolation';
import * as tables from './lumatone_color_table.json';

export const mod = (num, mod) => ((num % mod) + mod) % mod;

function clip(value, max, min=0) {
    return (value > max) ? max
         : (value < min) ? min
         : value;
}

function roundAndClip(value, max=255, min=0) {
    return clip(Math.round(value), max, min);
}

function hasProps(object, propKeys) {
    for (const prop of propKeys)
        if (object[prop] == null)
            return false;
    return true;
}

function propsAreEqual(object1, object2, propKeys, strict=false) {
    const compare = (a, b) => (strict) ? a === b : a == b;
    for (const prop of propKeys)
        if (!compare(object1[prop], object2[prop]))
            return false;
    return true;
}

export const ColorSpace = {
    RGB:    'rgb',
    RGBA:   'rgba',
    HSL:    'hsl',
    HSV:    'hsv',

    getProps: function (space) {
        switch(space) {
            case this.RGB:
                return [ 'r', 'g', 'b' ];
            case this.RGBA:
                return [ 'r', 'g', 'b', 'a' ];
            case this.HSL:
                return [ 'h', 's', 'l' ];
            case this.HSV:
                return [ 'h', 's', 'v' ];
        }
    }
}

export const LumatoneColorTables = {
    RAW: 'raw',
    ADJUSTED: 'adjusted'
};

function validateTableType(type) {
    switch(type) {
        case LumatoneColorTables.RAW:
        case LumatoneColorTables.ADJUSTED:
            return true;

        default:
            console.log('Unknown color table type: ' + type);
            return false;
    }
}

function validateInterpolationType(type) {
    switch (type) {
        case INTERPOLATION.NEAREST:
        case INTERPOLATION.LINEAR:
        case INTERPOLATION.TRILINEAR:
        case INTERPOLATION.CUBIC:
        case INTERPOLATION.TRICUBIC:
            return true;

        default:
            console.log('Unknown interpolation type: ' + type);
            return false;
    }
}

function getLinearNeighbors(tableType, r, g, b) {
    const increments = [ r, g, b ].map((x) => x / tables.increment);
    console.log('increments: ' + increments.join())
    const [ lR, lG, lB ] = increments.map((x) => clip(Math.floor(x), 16));
    const [ uR, uG, uB ] = increments.map((x) => clip(Math.ceil(x), 16));
    return { 
        lower:  tables[tableType][lR][lG][lB], 
        upper:  tables[tableType][uR][uG][uB],
        mu:     increments.map((x) => x - Math.trunc(x))
    };
}

function getCubicNeighbors(tableType, r, g, b) {
    const increments = [ r, g, b ].map(x => x / tables.increment);

    const [ lR, lG, lB ] = increments.map((x) => clip(Math.floor(x), 15));
    const [ uR, uG, uB ] = increments.map((x) => clip(Math.ceil(x), 15));

    const [ llR, llG, llB ] = [ lR, lG, lB ].map((x) => clip(x - 1, 15));
    const [ uuR, uuG, uuB ] = [ uR, uG, uB ].map((x) => clip(x + 1, 15));

    // console.log({increments: increments, lowest: [llR, llG, llB], lower: [lR, lG, lB], upper: [uR, uG, uB], uppest: [uuR, uuG, uuB]});

    const lowest = tables[tableType][llR][llG][llB];
    const lower =  tables[tableType][lR][lG][lB];
    const upper =  tables[tableType][uR][uG][uB];
    const uppest = tables[tableType][uuR][uuG][uuB];

    return {
        r:  [ lowest[0], lower[0], upper[0], uppest[0] ],
        g:  [ lowest[1], lower[1], upper[1], uppest[1] ],
        b:  [ lowest[2], lower[2], upper[2], uppest[2] ],
        mu: increments.map((x) => x - Math.trunc(x))
    };
}

function getTrilinearNeighbors(tableType, r, g, b) {
    const increments = [ r, g, b ].map(x => x / tables.increment);

    const lower     = increments.map((x) => clip(Math.floor(x), 15));
    const higher    = increments.map((x) => clip(Math.ceil(x), 15));

    let points = { r: [], g: [], b: [] };

    const tb = tables[tableType];

    const vertices = [ lower, higher ];

    for (var i = 0; i < vertices.length; i++) {
        for (var j = 0; j < vertices.length; j++) {
            for (var k = 0; k < vertices.length; k++) {
                let [ r, g, b ] = [ vertices[i][0], vertices[j][1], vertices[k][2] ];
                const color = tb[r][g][b];
                points.r.push(color[0]);
                points.g.push(color[1]);
                points.b.push(color[2]);
            }
        }
    }
    
    const result = {
        r:  points.r,
        g:  points.g,
        b:  points.b,
        mu: increments.map((x) => x - Math.trunc(x))
    };

    // console.log('TRILINEAR NEIGHBORS: ');
    // console.log(result);

    return result;
}

function getTricubicNeighbors(tableType, r, g, b) {
    const increments = [ r, g, b ].map(x => x / tables.increment);

    const lower     = increments.map((x) => clip(Math.floor(x), 15));
    const higher    = increments.map((x) => clip(Math.ceil(x), 15));

    const lowest    = lower.map((x) => clip(x - 1, 15));
    const highest   = higher.map((x) => clip(x + 1, 15));

    let points = { r: [], g: [], b: [] };

    const tb = tables[tableType];

    const vertices = [ lowest, lower, higher, highest ];

    for (var i = 0; i < vertices.length; i++) {
        let rPlanes = [];
        let gPlanes = [];
        let bPlanes = [];
        for (var j = 0; j < vertices.length; j++) {
            let rLines = [];
            let gLines = [];
            let bLines = [];
            for (var k = 0; k < vertices.length; k++) {
                let [ r, g, b ] = [ vertices[i][0], vertices[j][1], vertices[k][2] ];
                const color = tb[r][g][b];
                rLines.push(color[0]);
                gLines.push(color[1]);
                bLines.push(color[2]);
            }

            rPlanes.push(rLines);
            gPlanes.push(gLines);
            bPlanes.push(bLines);
        }
        
        points.r.push(rPlanes);
        points.g.push(gPlanes);
        points.b.push(bPlanes);
    }
    

    const result = {
        r:  points.r,
        g:  points.g,
        b:  points.b,
        mu: increments.map((x) => x - Math.trunc(x))
    };

    return result;
}

function getFirstOrderInterpolation(tableType, method, r, g, b) {
    switch (method) {
        case INTERPOLATION.NEAREST:
        case INTERPOLATION.LINEAR:
        {
            const neighbors = getLinearNeighbors(tableType, r, g, b);
            // console.log('neighbors')
            // console.log('mu: ' + JSON.stringify(neighbors.mu))
            // console.log('lower: ' + JSON.stringify(neighbors.lower));
            // console.log('upper: ' + JSON.stringify(neighbors.upper));
            const iR = interpolate(method, neighbors.mu[0], neighbors.lower[0], neighbors.upper[0]);
            const iG = interpolate(method, neighbors.mu[1], neighbors.lower[1], neighbors.upper[1]);
            const iB = interpolate(method, neighbors.mu[2], neighbors.lower[2], neighbors.upper[2]);
            return { 
                r: roundAndClip(iR), 
                g: roundAndClip(iG), 
                b: roundAndClip(iB) 
            };
        }
        case INTERPOLATION.TRILINEAR:
        {
            const neighbors = getTrilinearNeighbors(tableType, r, g, b);
            const iR = interpolate(method, neighbors.mu[0], neighbors.mu[1], neighbors.mu[2], ...neighbors.r);
            const iG = interpolate(method, neighbors.mu[1], neighbors.mu[0], neighbors.mu[2], ...neighbors.g);
            const iB = interpolate(method, neighbors.mu[2], neighbors.mu[1], neighbors.mu[2], ...neighbors.b);
            return {
                r: roundAndClip(iR), 
                g: roundAndClip(iG), 
                b: roundAndClip(iB) 
            }
        }
        default:
            throw new Error(method + ' is not a valid first order inpterpolation method!');
    };
}

function getCubicInterpolation(tableType, method, r, g, b) {
    switch (method) {
        case INTERPOLATION.TRICUBIC:
        {
            const neighbors = getTricubicNeighbors(tableType, r, g, b);
            // console.log('neigbors')
            // console.log(neighbors);
            const iR = interpolate(method, neighbors.mu[0], neighbors.mu[1], neighbors.mu[2], neighbors.r);
            const iG = interpolate(method, neighbors.mu[1], neighbors.mu[0], neighbors.mu[2], neighbors.g);
            const iB = interpolate(method, neighbors.mu[2], neighbors.mu[0], neighbors.mu[1], neighbors.b);
            return {
                r: roundAndClip(iR),
                g: roundAndClip(iG),
                b: roundAndClip(iB),
            }
        }
        case INTERPOLATION.CUBIC:
        {
            const neighbors = getCubicNeighbors(tableType, r, g, b);
            // console.log('neigbors:')
            // console.log(neighbors);
            const iR = interpolate(method, neighbors.mu[0], ...neighbors.r);
            const iG = interpolate(method, neighbors.mu[1], ...neighbors.g);
            const iB = interpolate(method, neighbors.mu[2], ...neighbors.b);
            return {
                r: roundAndClip(iR),
                g: roundAndClip(iG),
                b: roundAndClip(iB),
            }
        }
        default:
            throw new Error(method + ' is not a valid cubic interpolation method!');
    }
}

export class LumatoneColorModel {
    constructor(tableType, interpolationType) {
        if (tableType == null || !validateTableType(tableType))
            tableType = LumatoneColorTables.ADJUSTED;
        this.tableType = tableType;

        if (interpolationType == null || !validateInterpolationType(interpolationType))
            interpolationType = INTERPOLATION.NEAREST;
        this.interpolationType = interpolationType;
    }

    setTableType(type) {
        if (type == null)
            throw new Error('Table type provided is null');

        if (validateTableType(type))
            this.tableType = type;

        console.log('Table type set to: ' + this.tableType);
    }

    setInterpolationType(type) {
        if (type == null)
            throw new Error('Interpolation type provided is null');
        
        if (validateInterpolationType(type))
            this.interpolationType = type;

        console.log('Interpolation type set to: ' + this.interpolationType);
    }

    getColorWithOptions(r, g, b, tableType, interpolation) {
        if (!validateTableType(tableType))
            throw new Error('Invalid table type ' + tableType);

        if (!validateInterpolationType(interpolation))
            throw new Error('Invalid interpolation type: ' + interpolation);

        const [ R, G, B ] = [ r, g, b ].map((x) => roundAndClip(x));

        let color = { r: R, g: G, b: B };

        switch (interpolation)
            {
            case INTERPOLATION.NEAREST:
            case INTERPOLATION.LINEAR:
            default:
                color = getFirstOrderInterpolation(tableType, interpolation, R, G, B);
                break;

            case INTERPOLATION.CUBIC:
            case INTERPOLATION.TRICUBIC:
                color = getCubicInterpolation(tableType, interpolation, R, G, B);
                break;
            }

        // console.log('interpolated:')
        // console.log(color)

        return color;
    }

    getColor(r, g, b) {
        return this.getColorWithOptions(r, g, b, this.tableType, this.interpolationType);
    }

    getRed(r, g, b) {
        return this.getColor(r, g, b)[0];
    }
    
    getGreen(r, g, b) {
        return this.getColor(r, g, b)[1];
    }
    
    getBlue(r, g, b) {
        return this.getColor(r, g, b)[2];
    }
};


// export function hexToRgba(colorString) {
//     let rgbStr = colorString.slice(colorString.length - 6);
//     let a = 1;

//     if (rgbStr !== colorString)
//         {
//         let aStr = colorString.slice(0, 2);
//         a = parseInt(aStr, 16) / 255;
//         }

//     let R = parseInt(rgbStr.slice(0, 2), 16);
//     let G = parseInt(rgbStr.slice(2, 4), 16);
//     let B = parseInt(rgbStr.slice(4), 16);

//     return { r: R, g: G, b: B, a: a };
// }

// // expects {r: 0-255, g: 0-255, b: 0-255, a: 0-1} 
// export function rgbaToHex(color) {
//     let shorts = [
//         color.r.toString(16),
//         color.g.toString(16),
//         color.b.toString(16),
//         Math.round(color.a * 255).toString(16)
//     ];
//     return '#' + shorts.map(char => char.length === 1 ? `0${char}` : char).join('');
// }

// expects {r: 0-255, g: 0-255, b: 0-255, a: 0-1} 
// returns "rgba(r, g, b, a)"
// export function rgbaToString(color) {
//     return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
// }

// rgb, 0-255
export function rgbToHsl(R, G, B) {
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

// let colorModel = new LumatoneColorModel(LumatoneColorTables.ADJUSTED, INTERPOLATION.CUBIC);

// expects object { r, g, b, a }
// export function getRgbLed(color, table=LumatoneColorTables.ADJUSTED, interpolation=INTERPOLATION.CUBIC) {
//     // const hsv = rgbToHsv(color.r, color.g, color.b);
//     // let brightness = color.a * hsv.v;
//     // let ledRgb = hsvToRgb(hsv.h, hsv.s, 1);
//     // ledRgb.a = brightness;
//     // const brightness = hsv.v * 0.5 + 0.5;
//     // const alpha = (1 - (1 - hsv.v)) * color.a;
//     // let ledRgb = hsvToRgb(hsv.h, hsv.s, brightness);
//     // ledRgb.a = alpha;
//     // return ledRgb;

//     // let lumaColor = getLumatoneColor(LumatoneColorTables.RAW, color.r, color.g, color.b);
//     let lumaColor = colorModel.getColorWithOptions(color.r, color.g, color.b, table, interpolation);
//     return Object.assign(lumaColor, { a: 1 })
// }

export function ColorsAreClose(lumaColor1, lumaColor2, hueThresh=0.01, satThresh, lightThresh, alphaThresh) {
    const hsl1 = lumaColor1.getHsl();
    const hsl2 = lumaColor2.getHsl();

    const hueDif = Math.abs(hsl1.h - hsl2.h);
    if (hueDif > hueThresh)
        return false;

    satThresh = satThresh ?? hueThresh;
    const satDif = Math.abs(hsl1.s - hsl2.s);
    if (satDif > satThresh)
        return false;

    lightThresh = lightThresh ?? hueThresh;
    const lightDif = Math.abs(hsl1.l - hsl2.l);
    if (lightDif > lightThresh)
        return false;

    if (alphaThresh != null)
        {
        const alphaDif = Math.abs(hsl1.a - hsl2.a);
        if (alphaDif > alphaThresh)
            return false;
        }

    return true;
}

export class LumaColor {

    value = {}
    cache = {};
    
    constructor(space, ...args) {
        this.colorModel = new LumatoneColorModel(LumatoneColorTables.ADJUSTED, INTERPOLATION.CUBIC);

        switch(space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                this.setRgb(...args)
                break;
            case ColorSpace.HSL:
                this.setHsl(...args);
                break;
            case ColorSpace.HSV:
                this.setHsv(...args);
                break;
        }
    }

    static fromRgbString(rgbString) {
        let str = rgbString.slice(rgbString.length - 6);
        let a = 1;

        if (str !== rgbString)
            {
            let aStr = colorString.slice(0, 2);
            a = parseInt(aStr, 16) / 255;
            }
    
        let R = parseInt(str.slice(0, 2), 16);
        let G = parseInt(str.slice(2, 4), 16);
        let B = parseInt(str.slice(4), 16);
        return new LumaColor(ColorSpace.RGBA, R, G, B, a);
    }

    setDisplayColorTable(colorTable) {
        this.colorModel.setTableType(colorTable);
    }

    setDisplayColorInterpolation(interpolation) {
        this.colorModel.setInterpolationType(interpolation);
    }

    setAlpha(a) {
        a = clip(a, 1);
        this.alpha = a;
        this.value.alpha = a;
    }

    setRgb(r, g, b, a) {
        this.space = ColorSpace.RGBA;
        this.value = { 
            r: clip(r, 255), 
            g: clip(g, 255), 
            b: clip(b, 255) 
        };
        this.cache = {};
        this.setAlpha(a);
    }

    setHsl(h, s, l, a) {
        this.space = ColorSpace.HSL;
        this.value = { 
            h: clip(h, 1), 
            s: clip(s, 1), 
            l: clip(l, 1) 
        };
        this.cache = {};
        this.setAlpha(a);
    }

    setHsv(h, s, v, a) {
        this.space = ColorSpace.HSV;
        this.value = { 
            h: clip(h, 1), 
            s: clip(s, 1), 
            v: clip(v, 1) 
        };
        this.cache = {};
        this.setAlpha(a);
    }

    toRgbString() {
        let data = this.value;
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                break;
            default:
                this.cacheRgb();
                rgb = this.cache;
        }
        return `#${[ data.r, data.g, data.b ].map(x => x.toString(16).toUpperCase().padStart(2, '0')).join('')}`;
    }

    toString() {
        switch (this.space) {
            case ColorSpace.RGB:
                return this.toRgbString();
            case ColorSpace.RGBA:
                return `rgba(${this.value.r}, ${this.value.g}, ${this.value.b})`;
            case ColorSpace.HSL:
                return `hsl(${this.value.h}, ${this.value.s}, ${this.value.l})`;
            case ColorSpace.HSV:
                return `hsl(${this.value.h}, ${this.value.s}, ${this.value.v})`;
        }
    }

    get = () => this.value;

    toDisplayColor() {
        const displayColor = this.colorModel.getColor(this.value.r, this.value.g, this.value.b);
        return new LumaColor(ColorSpace.RGBA, ...Object.entries(displayColor).map(entry => entry[1]));
    }

    isExactly(color) {
        if (this.space.includes('rgb') && color.space.includes('rgb')) {
            return this.value.r === color.getR()
                && this.value.g === color.getG()
                && this.value.b === color.getB()
                && this.alpha === this.alpha;
        }

        if (this.space.includes('hs') && color.space.includes('hs')) {
            // todo compare L and V
        }

        if (this.space !== color.space)
            return false;

        return propsAreEqual(this, color, ColorSpace.getProps(this.space))
    }

    isCloseTo(color) {
        // todo better colorspace aware function?
        return ColorsAreClose(this, color, 0.01);
    }

    cacheRgb() {
        for (const val of [this.value, this.cache])
            if (hasProps(val, ColorSpace.getProps(ColorSpace.RGB)))
                return;
        switch (this.space) {
            case ColorSpace.HSL:
                Object.assign(
                    this.cache, 
                    this.hslToRgb(this.value.h, this.value.s, this.value.l));
                break;
            case ColorSpace.HSV:
                Object.assign(
                    this.cache,
                    this.hsvToRgb(this.value.h, this.value.s, this.value.v));
                break;
        }
    }

    cacheHsl() {
        for (const val of [this.value, this.cache])
            if (hasProps(val, ColorSpace.getProps(ColorSpace.HSL)))
                return;
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                Object.assign(
                    this.cache, 
                    this.rgbToHsl(this.value.r, this.value.g, this.value.b));
                break;
            case ColorSpace.HSV:
                // Object.assign(
                //     this.cache,
                //     this.hsvTo(this.value.h, this.value.s, this.value.v));
                // TODO
                break;
        }
    }

    cacheHsv() {
        for (const val of [this.value, this.cache])
            if (hasProps(val, ColorSpace.getProps(ColorSpace.HSV)))
                return;
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                Object.assign(
                    this.cache,
                    this.rgbToHsv(this.value.r, this.value.g, this.value.b));
                break;
            case ColorSpace.HSL:
                // Object.assign(
                //     this.cache,
                //     this.hsvTo(this.value.h, this.value.s, this.value.v));
                // TODO
                break;
        }
    }

    getRgb() {
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                return this.value;
            default:
                this.cacheRgb();
                return {
                    r: this.cache.r,
                    g: this.cache.g,
                    b: this.cache.b
                };
        }
    }

    getHsl() {
        if (this.space === ColorSpace.HSL)
            return this.value;
        this.cacheHsl();
        return {
            h: this.cache.h,
            s: this.cache.s,
            l: this.cache.l
        };
    }

    getHsv() {
        if (this.space === ColorSpace.HSV)
            return this.value;
        this.cacheHsv();
        return {
            h: this.cache.h,
            s: this.cache.s,
            v: this.cache.v
        };
    }

    getR() {
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                return this.value.r;
            default:
                this.cacheRgb();
                return this.cache.r;
        }
    }

    getG() {
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                return this.value.g;
            default:
                this.cacheRgb();
                return this.cache.g;
        }
    }

    getB() {
        switch (this.space) {
            case ColorSpace.RGB:
            case ColorSpace.RGBA:
                return this.value.b;
            default:
                this.cacheRgb();
                return this.cache.b;
        }
    }

    getHue() {
        switch (this.space) {
            case ColorSpace.HSL:
            case ColorSpace.HSV:
                return this.value.h;
            default:
                this.cacheHsl();
                return this.cache.h;
        }
    }

    getSaturation() {
        switch (this.space) {
            case ColorSpace.HSL:
            case ColorSpace.HSV:
                return this.value.s;
            default:
                this.cacheHsl();
                return this.cache.s;
        }
    }

    getLightness() {
        if (this.space == ColorSpace.HSL)
            return this.value.l;
        this.cacheHsl();
        return this.cache.l;
    }

    getValue() {
        if (this.space == ColorSpace.HSV)
            return this.value.v;
        this.cacheHsv();
        return this.cache.v;
    }
    
};
