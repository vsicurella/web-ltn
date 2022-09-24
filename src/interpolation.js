export const INTERPOLATION = {
    NEAREST: 'nearest',
    LINEAR: 'linear',
    TRILINEAR: 'trilinear',
    CUBIC: 'cubic',
    TRICUBIC: 'tricubic'
}

export function nearest(mu, x0, x1) {
    let result = x1;
    const delta = x1 - x0;
    if (delta != 0) {
        
        const lower = (delta > 0) ? x0 : x1;
        const higher = (lower == x0) ? x1 : x0;
        
        result = higher;
        if (mu < 0.5)
            result = lower;
        
    }
    
    // console.log(`nearest(${mu}, ${x0}, ${x1}) => ${result}`);
    return result;
}

export function linear(mu, x0, x1) {
    const delta = x1 - x0;
    if (delta === 0)
        return x0;

    const result = x0 * (1-mu) + x1 * mu;
    // console.log(`linear(${mu}, ${x0}, ${x1})\n\tdelta: ${delta}\n\tresult: ${result}`);

    return result;
}

export function bilinear(xMu, yMu, x0, x1, x2, x3) {
    const c0 = linear(yMu, x0, x1);
    const c1 = linear(yMu, x2, x3);
    const result = linear(xMu, c0, c1);
    // console.log(`bilinear(${xMu}, ${yMu}, ${x0}, ${x1}, ${x2}, ${x3}) => ${result}`);
    return result;
}

export function trilinear(xMu, yMu, zMu, x0, x1, x2, x3, x4, x5, x6, x7) {
    const c0 = bilinear(xMu, yMu, x0, x1, x2, x3);
    const c1 = bilinear(xMu, yMu, x4, x5, x6, x7);
    const result = linear(zMu, c0, c1);
    // console.log(`trilinear(${xMu}, ${yMu}, ${x0}, ${x1}, ${x2}, ${x3}, ${x4}, ${x5}, ${x6}, ${x7}) => ${result})`);
    return result;
}

export function cubic(mu, x_2, x_1, x1, x2) {
    const mumu = mu * mu;
    const a0 = x2 - x1 - x_2 + x_1
    const a1 = x_2 - x_1 - a0;
    const a2 = x1 - x_2;
    const a3 = x_1;
    const result = a0 * mu * mumu + a1 * mumu + a2 * mu + a3;
    // console.log(`cubic(${mu}, ${x_2}, ${x_1}, ${x1}, ${x2})\n\tmumu: ${mumu}\n\ta0: ${a0},\n\ta1: ${a1},\n\ta2: ${a2},\n\ta3: ${a3},\n\tresult: ${result}`)
    return result
}

export function bicubic(xMu, yMu, samples2d) {
    let samples = []
    samples.push(cubic(yMu, ...samples2d[0]));
    samples.push(cubic(yMu, ...samples2d[1]));
    samples.push(cubic(yMu, ...samples2d[2]));
    samples.push(cubic(yMu, ...samples2d[3]));
    return cubic(xMu, ...samples);
}

export function tricubic(xMu, yMu, zMu, samples3d) {
    let samples = [];
    samples.push(bicubic(yMu, zMu, samples3d[0]));
    samples.push(bicubic(yMu, zMu, samples3d[1]));
    samples.push(bicubic(yMu, zMu, samples3d[2]));
    samples.push(bicubic(yMu, zMu, samples3d[3]));
    return cubic(xMu, ...samples);
}

/*

    For
        INTERPOLATION.NEAREST,
        INTERPOLATION.LINEAR:
        interpolate(type, mu, lower, higher)

    For 
        INTERPOLATION.CUBIC:
        interpolate(type, mu, lowest, lower, higher, highest)

    For
        INTERPOLATION.TRICUBIC:
        interpolate(type, xMu, yMu, zMu, samples3d)

*/
export function interpolate(type, mu, ...args) {
    switch (type)
        {
        case INTERPOLATION.NEAREST:
        default:
            return nearest(mu, args[0], args[1]);

        case INTERPOLATION.LINEAR:
            return linear(mu, args[0], args[1]);

        case INTERPOLATION.TRILINEAR:
            return trilinear(mu, ...args);
            
        case INTERPOLATION.CUBIC:
            return cubic(mu, args[0], args[1], args[2], args[3]);

        case INTERPOLATION.TRICUBIC:
            return tricubic(mu, args[0], args[1], args[2]);
        }
}
