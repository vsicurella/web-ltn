import { INTERPOLATION, interpolate } from './interpolation';
import * as tables from './lumatone_color_table.json';

function clip(value, min=0, max=255) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}


function roundAndClip(value, min=0, max=255) {
    return clip(Math.round(value), min, max);
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
    const [ lR, lG, lB ] = increments.map((x) => clip(Math.floor(x), 0, 16));
    const [ uR, uG, uB ] = increments.map((x) => clip(Math.ceil(x), 0, 16));
    return { 
        lower:  tables[tableType][lR][lG][lB], 
        upper:  tables[tableType][uR][uG][uB],
        mu:     increments.map((x) => x - Math.trunc(x))
    };
}

function getCubicNeighbors(tableType, r, g, b) {
    const increments = [ r, g, b ].map(x => x / tables.increment);

    const [ lR, lG, lB ] = increments.map((x) => clip(Math.floor(x), 0, 15));
    const [ uR, uG, uB ] = increments.map((x) => clip(Math.ceil(x), 0, 15));

    const [ llR, llG, llB ] = [ lR, lG, lB ].map((x) => clip(x - 1, 0, 15));
    const [ uuR, uuG, uuB ] = [ uR, uG, uB ].map((x) => clip(x + 1, 0, 15));

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

    const lower     = increments.map((x) => clip(Math.floor(x), 0, 15));
    const higher    = increments.map((x) => clip(Math.ceil(x), 0, 15));

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

    const lower     = increments.map((x) => clip(Math.floor(x), 0, 15));
    const higher    = increments.map((x) => clip(Math.ceil(x), 0, 15));

    const lowest    = lower.map((x) => clip(x - 1, 0, 15));
    const highest   = higher.map((x) => clip(x + 1, 0, 15));

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
        // console.log('post clip color:')
        // console.log(JSON.stringify(color))

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
