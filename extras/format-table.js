const tables = require('../src/lumatone_color_table.json');
const fs = require('fs');

function main() {

    let formatted = Object.assign({}, tables);

    formatted.raw = tables.raw.map(x1 => x1.map(x2 => x2.map(x3 => x3.map((value, i, a) => Math.max(0, Math.min(255, a[i] = Math.round(value)))))));
    formatted.adjusted = tables.adjusted.map(x1 => x1.map(x2 => x2.map(x3 => x3.map((value, i, a) => Math.max(0, Math.min(255, a[i] = Math.round(value)))))));

    fs.writeFileSync("lumatone_colour_int.json", JSON.stringify(formatted));
}

main();
