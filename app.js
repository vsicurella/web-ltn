function getLineType(line) {
    if (/\[Board\d\]/.test(line))
        return 'board';
    if (/Key/.test(line))
        return 'note';
    if (/Chan/.test(line))
        return 'channel';
    if (/Col/.test(line))
        return 'color';
    if (/KTyp/.test(line))
        return 'type';
    if (/CCInvert/.test(line))
        return 'ccInvert';
    if (line.includes('='))
        return 'table';
    return 'invalid';
}

const getBoardNum       = (line) => line.match(/\d/)[0];
const getKeyNum         = (line) => line.split('_')[1]?.split('=')[0];
const getLineValue      = (line) => line.split('=')[1];
const getTableName      = (line) => line.split('=')[0];
const getTableValues    = (line) => line.split('=')[1].split(' ').map(x => parseInt(x));

function parseLtn(ltn) {
    const lines = ltn.split(/[\n\r]/);

    let mappingData = {};
    let currentBoard;
    let currentKey;

    for (const line of lines) {
        const linetype = getLineType(line);
        switch (linetype) {
            case 'board':
                currentBoard = {};
                mappingData[getBoardNum(line)] = currentBoard;
                break;

            case 'table':
                currentBoard[getTableName(line)] = getTableValues(line);
                break;

            case 'invalid':
                break;

            default:    
                if (currentBoard[getKeyNum(line)] === undefined)
                    currentBoard[getKeyNum(line)] = {};
                currentKey = currentBoard[getKeyNum(line)];

                switch (linetype) {
                    case 'ccInvert':
                        currentKey['ccInvert'] = true;
                        break;

                    default:
                        currentKey[linetype] = getLineValue(line);
                        break;
                }
        }
    }

    console.log(mappingData);
    return mappingData;
}

function readFile(file) {
    const data = file.target.result;
    
    if (data == null)
        throw new Error("unable to read file");

    return parseLtn(data);
}

function loadFile() {
    const fileinfo = document.getElementById('ltn-file').files[0];
    const name = fileinfo.name;
    console.log('loading ' + name);

    let file = new FileReader();
    file.onload=readFile;
    file.readAsText(fileinfo);
}