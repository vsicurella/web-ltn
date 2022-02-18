import { renderToCanvas, refreshColor } from "./draw";

export const NUMOCTAVES = 5;
export const KEYSPEROCT = 56;

function getLineType(line) {
    if (/^\[Board\d\]/.test(line))
        return 'board';
    if (/^Key/.test(line))
        return 'note';
    if (/^Chan/.test(line))
        return 'channel';
    if (/^Col/.test(line))
        return 'color';
    if (/^KTyp/.test(line))
        return 'type';
    if (/^CCInvert/.test(line))
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

function parseLtn(ltnText) {
    const lines = ltnText.split(/[\n\r]/);

    let mappingData = {};
    let currentBoard;
    let currentKey;
    let keyNum;

    for (const line of lines) {
        const linetype = getLineType(line);
        switch (linetype) {
            case 'board':
                currentBoard = {};
                mappingData[getBoardNum(line)] = currentBoard;
                break;

            case 'table':
                mappingData[getTableName(line)] = getTableValues(line);
                break;

            case 'invalid':
                break;

            default:    
                keyNum = getKeyNum(line);
                if (keyNum == null) {
                    console.log('bad key: ' + line);
                    continue;
                }
                if (currentBoard[keyNum] === undefined)
                    currentBoard[keyNum] = {};
                currentKey = currentBoard[keyNum];

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

    return mappingData;
}

export class LtnMapping {
    constructor(mappingData) {
        // this.mapping = mappingData;
        this.mapping = {
            "0": {
              "0": {
                "note": "3",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "1": {
                "note": "7",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "2": {
                "note": "6",
                "channel": "1",
                "color": "ffffffff"
              },
              "3": {
                "note": "10",
                "channel": "1",
                "color": "ffffffff"
              },
              "4": {
                "note": "14",
                "channel": "1",
                "color": "ff502477"
              },
              "5": {
                "note": "18",
                "channel": "1",
                "color": "ff502477"
              },
              "6": {
                "note": "22",
                "channel": "1",
                "color": "ffffffff"
              },
              "7": {
                "note": "5",
                "channel": "1",
                "color": "ff034da1"
              },
              "8": {
                "note": "9",
                "channel": "1",
                "color": "ff034da1"
              },
              "9": {
                "note": "13",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "10": {
                "note": "17",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "11": {
                "note": "21",
                "channel": "1",
                "color": "ff008ed4"
              },
              "12": {
                "note": "25",
                "channel": "1",
                "color": "ff034da1"
              },
              "13": {
                "note": "8",
                "channel": "1",
                "color": "ff502477"
              },
              "14": {
                "note": "12",
                "channel": "1",
                "color": "ffffffff"
              },
              "15": {
                "note": "16",
                "channel": "1",
                "color": "ffffffff"
              },
              "16": {
                "note": "20",
                "channel": "1",
                "color": "ffffffff"
              },
              "17": {
                "note": "24",
                "channel": "1",
                "color": "ff502477"
              },
              "18": {
                "note": "28",
                "channel": "1",
                "color": "ff502477"
              },
              "19": {
                "note": "7",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "20": {
                "note": "11",
                "channel": "1",
                "color": "ff008ed4"
              },
              "21": {
                "note": "15",
                "channel": "1",
                "color": "ff034da1"
              },
              "22": {
                "note": "19",
                "channel": "1",
                "color": "ff034da1"
              },
              "23": {
                "note": "23",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "24": {
                "note": "27",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "25": {
                "note": "10",
                "channel": "1",
                "color": "ffffffff"
              },
              "26": {
                "note": "14",
                "channel": "1",
                "color": "ff502477"
              },
              "27": {
                "note": "18",
                "channel": "1",
                "color": "ff502477"
              },
              "28": {
                "note": "22",
                "channel": "1",
                "color": "ffffffff"
              },
              "29": {
                "note": "26",
                "channel": "1",
                "color": "ffffffff"
              },
              "30": {
                "note": "30",
                "channel": "1",
                "color": "ffffffff"
              },
              "31": {
                "note": "9",
                "channel": "1",
                "color": "ff034da1"
              },
              "32": {
                "note": "13",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "33": {
                "note": "17",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "34": {
                "note": "21",
                "channel": "1",
                "color": "ff008ed4"
              },
              "35": {
                "note": "25",
                "channel": "1",
                "color": "ff034da1"
              },
              "36": {
                "note": "29",
                "channel": "1",
                "color": "ff034da1"
              },
              "37": {
                "note": "12",
                "channel": "1",
                "color": "ffffffff"
              },
              "38": {
                "note": "16",
                "channel": "1",
                "color": "ffffffff"
              },
              "39": {
                "note": "20",
                "channel": "1",
                "color": "ffffffff"
              },
              "40": {
                "note": "24",
                "channel": "1",
                "color": "ff502477"
              },
              "41": {
                "note": "28",
                "channel": "1",
                "color": "ff502477"
              },
              "42": {
                "note": "32",
                "channel": "1",
                "color": "ff502477"
              },
              "43": {
                "note": "11",
                "channel": "1",
                "color": "ff008ed4"
              },
              "44": {
                "note": "15",
                "channel": "1",
                "color": "ff034da1"
              },
              "45": {
                "note": "19",
                "channel": "1",
                "color": "ff034da1"
              },
              "46": {
                "note": "23",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "47": {
                "note": "27",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "48": {
                "note": "31",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "49": {
                "note": "18",
                "channel": "1",
                "color": "ff502477"
              },
              "50": {
                "note": "22",
                "channel": "1",
                "color": "ffffffff"
              },
              "51": {
                "note": "26",
                "channel": "1",
                "color": "ffffffff"
              },
              "52": {
                "note": "30",
                "channel": "1",
                "color": "ffffffff"
              },
              "53": {
                "note": "34",
                "channel": "1",
                "color": "ffffffff"
              },
              "54": {
                "note": "29",
                "channel": "1",
                "color": "ff034da1"
              },
              "55": {
                "note": "33",
                "channel": "1",
                "color": "ff034da1"
              }
            },
            "1": {
              "0": {
                "note": "29",
                "channel": "1",
                "color": "ff034da1"
              },
              "1": {
                "note": "33",
                "channel": "1",
                "color": "ff034da1"
              },
              "2": {
                "note": "32",
                "channel": "1",
                "color": "ff502477"
              },
              "3": {
                "note": "36",
                "channel": "1",
                "color": "ffffffff"
              },
              "4": {
                "note": "40",
                "channel": "1",
                "color": "ffffffff"
              },
              "5": {
                "note": "44",
                "channel": "1",
                "color": "ffffffff"
              },
              "6": {
                "note": "48",
                "channel": "1",
                "color": "ff502477"
              },
              "7": {
                "note": "31",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "8": {
                "note": "35",
                "channel": "1",
                "color": "ff008ed4"
              },
              "9": {
                "note": "39",
                "channel": "1",
                "color": "ff034da1"
              },
              "10": {
                "note": "43",
                "channel": "1",
                "color": "ff034da1"
              },
              "11": {
                "note": "47",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "12": {
                "note": "51",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "13": {
                "note": "34",
                "channel": "1",
                "color": "ffffffff"
              },
              "14": {
                "note": "38",
                "channel": "1",
                "color": "ff502477"
              },
              "15": {
                "note": "42",
                "channel": "1",
                "color": "ff502477"
              },
              "16": {
                "note": "46",
                "channel": "1",
                "color": "ffffffff"
              },
              "17": {
                "note": "50",
                "channel": "1",
                "color": "ffffffff"
              },
              "18": {
                "note": "54",
                "channel": "1",
                "color": "ffffffff"
              },
              "19": {
                "note": "33",
                "channel": "1",
                "color": "ff034da1"
              },
              "20": {
                "note": "37",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "21": {
                "note": "41",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "22": {
                "note": "45",
                "channel": "1",
                "color": "ff008ed4"
              },
              "23": {
                "note": "49",
                "channel": "1",
                "color": "ff034da1"
              },
              "24": {
                "note": "53",
                "channel": "1",
                "color": "ff034da1"
              },
              "25": {
                "note": "36",
                "channel": "1",
                "color": "ffffffff"
              },
              "26": {
                "note": "40",
                "channel": "1",
                "color": "ffffffff"
              },
              "27": {
                "note": "44",
                "channel": "1",
                "color": "ffffffff"
              },
              "28": {
                "note": "48",
                "channel": "1",
                "color": "ff502477"
              },
              "29": {
                "note": "52",
                "channel": "1",
                "color": "ff502477"
              },
              "30": {
                "note": "56",
                "channel": "1",
                "color": "ff502477"
              },
              "31": {
                "note": "35",
                "channel": "1",
                "color": "ff008ed4"
              },
              "32": {
                "note": "39",
                "channel": "1",
                "color": "ff034da1"
              },
              "33": {
                "note": "43",
                "channel": "1",
                "color": "ff034da1"
              },
              "34": {
                "note": "47",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "35": {
                "note": "51",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "36": {
                "note": "55",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "37": {
                "note": "38",
                "channel": "1",
                "color": "ff502477"
              },
              "38": {
                "note": "42",
                "channel": "1",
                "color": "ff502477"
              },
              "39": {
                "note": "46",
                "channel": "1",
                "color": "ffffffff"
              },
              "40": {
                "note": "50",
                "channel": "1",
                "color": "ffffffff"
              },
              "41": {
                "note": "54",
                "channel": "1",
                "color": "ffffffff"
              },
              "42": {
                "note": "58",
                "channel": "1",
                "color": "ffffffff"
              },
              "43": {
                "note": "37",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "44": {
                "note": "41",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "45": {
                "note": "45",
                "channel": "1",
                "color": "ff008ed4"
              },
              "46": {
                "note": "49",
                "channel": "1",
                "color": "ff034da1"
              },
              "47": {
                "note": "53",
                "channel": "1",
                "color": "ff034da1"
              },
              "48": {
                "note": "57",
                "channel": "1",
                "color": "ff034da1"
              },
              "49": {
                "note": "44",
                "channel": "1",
                "color": "ffffffff"
              },
              "50": {
                "note": "48",
                "channel": "1",
                "color": "ff502477"
              },
              "51": {
                "note": "52",
                "channel": "1",
                "color": "ff502477"
              },
              "52": {
                "note": "56",
                "channel": "1",
                "color": "ff502477"
              },
              "53": {
                "note": "60",
                "channel": "1",
                "color": "ffffffff"
              },
              "54": {
                "note": "55",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "55": {
                "note": "59",
                "channel": "1",
                "color": "ff008ed4"
              }
            },
            "2": {
              "0": {
                "note": "55",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "1": {
                "note": "59",
                "channel": "1",
                "color": "ff008ed4"
              },
              "2": {
                "note": "58",
                "channel": "1",
                "color": "ffffffff"
              },
              "3": {
                "note": "62",
                "channel": "1",
                "color": "ff502477"
              },
              "4": {
                "note": "66",
                "channel": "1",
                "color": "ff502477"
              },
              "5": {
                "note": "70",
                "channel": "1",
                "color": "ffffffff"
              },
              "6": {
                "note": "74",
                "channel": "1",
                "color": "ffffffff"
              },
              "7": {
                "note": "57",
                "channel": "1",
                "color": "ff034da1"
              },
              "8": {
                "note": "61",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "9": {
                "note": "65",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "10": {
                "note": "69",
                "channel": "1",
                "color": "ff008ed4"
              },
              "11": {
                "note": "73",
                "channel": "1",
                "color": "ff034da1"
              },
              "12": {
                "note": "77",
                "channel": "1",
                "color": "ff034da1"
              },
              "13": {
                "note": "60",
                "channel": "1",
                "color": "ffffffff"
              },
              "14": {
                "note": "64",
                "channel": "1",
                "color": "ffffffff"
              },
              "15": {
                "note": "68",
                "channel": "1",
                "color": "ffffffff"
              },
              "16": {
                "note": "72",
                "channel": "1",
                "color": "ff502477"
              },
              "17": {
                "note": "76",
                "channel": "1",
                "color": "ff502477"
              },
              "18": {
                "note": "80",
                "channel": "1",
                "color": "ff502477"
              },
              "19": {
                "note": "59",
                "channel": "1",
                "color": "ff008ed4"
              },
              "20": {
                "note": "63",
                "channel": "1",
                "color": "ff034da1"
              },
              "21": {
                "note": "67",
                "channel": "1",
                "color": "ff034da1"
              },
              "22": {
                "note": "71",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "23": {
                "note": "75",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "24": {
                "note": "79",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "25": {
                "note": "62",
                "channel": "1",
                "color": "ff502477"
              },
              "26": {
                "note": "66",
                "channel": "1",
                "color": "ff502477"
              },
              "27": {
                "note": "70",
                "channel": "1",
                "color": "ffffffff"
              },
              "28": {
                "note": "74",
                "channel": "1",
                "color": "ffffffff"
              },
              "29": {
                "note": "78",
                "channel": "1",
                "color": "ffffffff"
              },
              "30": {
                "note": "82",
                "channel": "1",
                "color": "ffffffff"
              },
              "31": {
                "note": "61",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "32": {
                "note": "65",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "33": {
                "note": "69",
                "channel": "1",
                "color": "ff008ed4"
              },
              "34": {
                "note": "73",
                "channel": "1",
                "color": "ff034da1"
              },
              "35": {
                "note": "77",
                "channel": "1",
                "color": "ff034da1"
              },
              "36": {
                "note": "81",
                "channel": "1",
                "color": "ff034da1"
              },
              "37": {
                "note": "64",
                "channel": "1",
                "color": "ffffffff"
              },
              "38": {
                "note": "68",
                "channel": "1",
                "color": "ffffffff"
              },
              "39": {
                "note": "72",
                "channel": "1",
                "color": "ff502477"
              },
              "40": {
                "note": "76",
                "channel": "1",
                "color": "ff502477"
              },
              "41": {
                "note": "80",
                "channel": "1",
                "color": "ff502477"
              },
              "42": {
                "note": "84",
                "channel": "1",
                "color": "ffffffff"
              },
              "43": {
                "note": "63",
                "channel": "1",
                "color": "ff034da1"
              },
              "44": {
                "note": "67",
                "channel": "1",
                "color": "ff034da1"
              },
              "45": {
                "note": "71",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "46": {
                "note": "75",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "47": {
                "note": "79",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "48": {
                "note": "83",
                "channel": "1",
                "color": "ff008ed4"
              },
              "49": {
                "note": "70",
                "channel": "1",
                "color": "ffffffff"
              },
              "50": {
                "note": "74",
                "channel": "1",
                "color": "ffffffff"
              },
              "51": {
                "note": "78",
                "channel": "1",
                "color": "ffffffff"
              },
              "52": {
                "note": "82",
                "channel": "1",
                "color": "ffffffff"
              },
              "53": {
                "note": "86",
                "channel": "1",
                "color": "ff502477"
              },
              "54": {
                "note": "81",
                "channel": "1",
                "color": "ff034da1"
              },
              "55": {
                "note": "85",
                "channel": "1",
                "color": "ff12dfe3"
              }
            },
            "3": {
              "0": {
                "note": "81",
                "channel": "1",
                "color": "ff034da1"
              },
              "1": {
                "note": "85",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "2": {
                "note": "84",
                "channel": "1",
                "color": "ffffffff"
              },
              "3": {
                "note": "88",
                "channel": "1",
                "color": "ffffffff"
              },
              "4": {
                "note": "92",
                "channel": "1",
                "color": "ffffffff"
              },
              "5": {
                "note": "96",
                "channel": "1",
                "color": "ff502477"
              },
              "6": {
                "note": "100",
                "channel": "1",
                "color": "ff502477"
              },
              "7": {
                "note": "83",
                "channel": "1",
                "color": "ff008ed4"
              },
              "8": {
                "note": "87",
                "channel": "1",
                "color": "ff034da1"
              },
              "9": {
                "note": "91",
                "channel": "1",
                "color": "ff034da1"
              },
              "10": {
                "note": "95",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "11": {
                "note": "99",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "12": {
                "note": "103",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "13": {
                "note": "86",
                "channel": "1",
                "color": "ff502477"
              },
              "14": {
                "note": "90",
                "channel": "1",
                "color": "ff502477"
              },
              "15": {
                "note": "94",
                "channel": "1",
                "color": "ffffffff"
              },
              "16": {
                "note": "98",
                "channel": "1",
                "color": "ffffffff"
              },
              "17": {
                "note": "102",
                "channel": "1",
                "color": "ffffffff"
              },
              "18": {
                "note": "106",
                "channel": "1",
                "color": "ffffffff"
              },
              "19": {
                "note": "85",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "20": {
                "note": "89",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "21": {
                "note": "93",
                "channel": "1",
                "color": "ff008ed4"
              },
              "22": {
                "note": "97",
                "channel": "1",
                "color": "ff034da1"
              },
              "23": {
                "note": "101",
                "channel": "1",
                "color": "ff034da1"
              },
              "24": {
                "note": "105",
                "channel": "1",
                "color": "ff034da1"
              },
              "25": {
                "note": "88",
                "channel": "1",
                "color": "ffffffff"
              },
              "26": {
                "note": "92",
                "channel": "1",
                "color": "ffffffff"
              },
              "27": {
                "note": "96",
                "channel": "1",
                "color": "ff502477"
              },
              "28": {
                "note": "100",
                "channel": "1",
                "color": "ff502477"
              },
              "29": {
                "note": "104",
                "channel": "1",
                "color": "ff502477"
              },
              "30": {
                "note": "108",
                "channel": "1",
                "color": "ffffffff"
              },
              "31": {
                "note": "87",
                "channel": "1",
                "color": "ff034da1"
              },
              "32": {
                "note": "91",
                "channel": "1",
                "color": "ff034da1"
              },
              "33": {
                "note": "95",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "34": {
                "note": "99",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "35": {
                "note": "103",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "36": {
                "note": "107",
                "channel": "1",
                "color": "ff008ed4"
              },
              "37": {
                "note": "90",
                "channel": "1",
                "color": "ff502477"
              },
              "38": {
                "note": "94",
                "channel": "1",
                "color": "ffffffff"
              },
              "39": {
                "note": "98",
                "channel": "1",
                "color": "ffffffff"
              },
              "40": {
                "note": "102",
                "channel": "1",
                "color": "ffffffff"
              },
              "41": {
                "note": "106",
                "channel": "1",
                "color": "ffffffff"
              },
              "42": {
                "note": "110",
                "channel": "1",
                "color": "ff502477"
              },
              "43": {
                "note": "89",
                "channel": "1",
                "color": "ff034da1"
              },
              "44": {
                "note": "93",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "45": {
                "note": "97",
                "channel": "1",
                "color": "ff034da1"
              },
              "46": {
                "note": "101",
                "channel": "1",
                "color": "ff034da1"
              },
              "47": {
                "note": "105",
                "channel": "1",
                "color": "ff034da1"
              },
              "48": {
                "note": "109",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "49": {
                "note": "96",
                "channel": "1",
                "color": "ff502477"
              },
              "50": {
                "note": "100",
                "channel": "1",
                "color": "ff502477"
              },
              "51": {
                "note": "104",
                "channel": "1",
                "color": "ff502477"
              },
              "52": {
                "note": "108",
                "channel": "1",
                "color": "ffffffff"
              },
              "53": {
                "note": "112",
                "channel": "1",
                "color": "ffffffff"
              },
              "54": {
                "note": "107",
                "channel": "1",
                "color": "ff008ed4"
              },
              "55": {
                "note": "111",
                "channel": "1",
                "color": "ff034da1"
              }
            },
            "4": {
              "0": {
                "note": "107",
                "channel": "1",
                "color": "ff008ed4"
              },
              "1": {
                "note": "111",
                "channel": "1",
                "color": "ff034da1"
              },
              "2": {
                "note": "110",
                "channel": "1",
                "color": "ff502477"
              },
              "3": {
                "note": "114",
                "channel": "1",
                "color": "ff502477"
              },
              "4": {
                "note": "118",
                "channel": "1",
                "color": "ffffffff"
              },
              "5": {
                "note": "122",
                "channel": "1",
                "color": "ffffffff"
              },
              "6": {
                "note": "126",
                "channel": "1",
                "color": "ffffffff"
              },
              "7": {
                "note": "109",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "8": {
                "note": "113",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "9": {
                "note": "117",
                "channel": "1",
                "color": "ff008ed4"
              },
              "10": {
                "note": "121",
                "channel": "1",
                "color": "ff034da1"
              },
              "11": {
                "note": "125",
                "channel": "1",
                "color": "ff034da1"
              },
              "12": {
                "note": "0",
                "channel": "0",
                "color": "ff034da1"
              },
              "13": {
                "note": "112",
                "channel": "1",
                "color": "ffffffff"
              },
              "14": {
                "note": "116",
                "channel": "1",
                "color": "ffffffff"
              },
              "15": {
                "note": "120",
                "channel": "1",
                "color": "ff502477"
              },
              "16": {
                "note": "124",
                "channel": "1",
                "color": "ff502477"
              },
              "17": {
                "note": "0",
                "channel": "0",
                "color": "ff502477"
              },
              "18": {
                "note": "0",
                "channel": "0",
                "color": "ffffffff"
              },
              "19": {
                "note": "111",
                "channel": "1",
                "color": "ff034da1"
              },
              "20": {
                "note": "115",
                "channel": "1",
                "color": "ff034da1"
              },
              "21": {
                "note": "119",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "22": {
                "note": "123",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "23": {
                "note": "127",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "24": {
                "note": "0",
                "channel": "0",
                "color": "ff008ed4"
              },
              "25": {
                "note": "114",
                "channel": "1",
                "color": "ff502477"
              },
              "26": {
                "note": "118",
                "channel": "1",
                "color": "ffffffff"
              },
              "27": {
                "note": "122",
                "channel": "1",
                "color": "ffffffff"
              },
              "28": {
                "note": "126",
                "channel": "1",
                "color": "ffffffff"
              },
              "29": {
                "note": "0",
                "channel": "0",
                "color": "ffffffff"
              },
              "30": {
                "note": "0",
                "channel": "0",
                "color": "ff502477"
              },
              "31": {
                "note": "113",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "32": {
                "note": "117",
                "channel": "1",
                "color": "ff008ed4"
              },
              "33": {
                "note": "121",
                "channel": "1",
                "color": "ff034da1"
              },
              "34": {
                "note": "125",
                "channel": "1",
                "color": "ff034da1"
              },
              "35": {
                "note": "0",
                "channel": "0",
                "color": "ff034da1"
              },
              "36": {
                "note": "0",
                "channel": "0",
                "color": "ff12dfe3"
              },
              "37": {
                "note": "116",
                "channel": "1",
                "color": "ffffffff"
              },
              "38": {
                "note": "120",
                "channel": "1",
                "color": "ff502477"
              },
              "39": {
                "note": "124",
                "channel": "1",
                "color": "ff502477"
              },
              "40": {
                "note": "0",
                "channel": "0",
                "color": "ff502477"
              },
              "41": {
                "note": "0",
                "channel": "0",
                "color": "ffffffff"
              },
              "42": {
                "note": "0",
                "channel": "0",
                "color": "ffffffff"
              },
              "43": {
                "note": "115",
                "channel": "1",
                "color": "ff034da1"
              },
              "44": {
                "note": "119",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "45": {
                "note": "123",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "46": {
                "note": "127",
                "channel": "1",
                "color": "ff12dfe3"
              },
              "47": {
                "note": "0",
                "channel": "0",
                "color": "ff008ed4"
              },
              "48": {
                "note": "0",
                "channel": "0",
                "color": "ff034da1"
              },
              "49": {
                "note": "122",
                "channel": "1",
                "color": "ffffffff"
              },
              "50": {
                "note": "126",
                "channel": "1",
                "color": "ffffffff"
              },
              "51": {
                "note": "0",
                "channel": "0",
                "color": "ffffffff"
              },
              "52": {
                "note": "0",
                "channel": "0",
                "color": "ff502477"
              },
              "53": {
                "note": "0",
                "channel": "0",
                "color": "ff502477"
              },
              "54": {
                "note": "0",
                "channel": "0",
                "color": "ff12dfe3"
              },
              "55": {
                "note": "0",
                "channel": "0",
                "color": "ff12dfe3"
              }
            },
            "AfterTouchActive": [
              1
            ],
            "LightOnKeyStrokes": [
              1
            ],
            "InvertFootController": [
              0
            ],
            "ExprCtrlSensivity": [
              0
            ],
            "VelocityIntrvlTbl": [
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              60,
              61,
              62,
              63,
              64,
              66,
              67,
              68,
              70,
              71,
              72,
              73,
              74,
              76,
              77,
              79,
              81,
              82,
              84,
              86,
              88,
              90,
              92,
              94,
              96,
              98,
              101,
              104,
              107,
              111,
              115,
              119,
              124,
              129,
              134,
              140,
              146,
              152,
              159,
              170,
              171,
              175,
              180,
              185,
              190,
              195,
              200,
              205,
              210,
              215,
              220,
              225,
              230,
              235,
              240,
              245,
              250,
              255,
              260,
              265,
              270,
              275,
              280,
              285,
              290,
              295,
              300,
              305,
              310,
              315,
              null
            ],
            "NoteOnOffVelocityCrvTbl": [
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              63,
              64,
              65,
              66,
              68,
              69,
              70,
              72,
              73,
              74,
              76,
              77,
              79,
              80,
              82,
              84,
              85,
              87,
              88,
              90,
              92,
              94,
              96,
              97,
              99,
              101,
              103,
              105,
              108,
              110,
              112,
              114,
              117,
              119,
              121,
              124,
              127,
              null
            ],
            "FaderConfig": [
              1,
              2,
              2,
              2,
              3,
              3,
              3,
              4,
              4,
              4,
              5,
              5,
              6,
              6,
              6,
              7,
              7,
              7,
              8,
              8,
              9,
              9,
              9,
              10,
              10,
              10,
              11,
              11,
              12,
              12,
              12,
              13,
              13,
              14,
              14,
              14,
              15,
              15,
              16,
              16,
              17,
              17,
              17,
              18,
              18,
              19,
              19,
              20,
              20,
              20,
              21,
              21,
              22,
              22,
              23,
              23,
              24,
              24,
              25,
              25,
              26,
              26,
              27,
              27,
              28,
              28,
              29,
              29,
              30,
              31,
              31,
              32,
              32,
              33,
              33,
              34,
              35,
              35,
              36,
              37,
              37,
              38,
              39,
              39,
              40,
              41,
              41,
              42,
              43,
              44,
              45,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              55,
              56,
              57,
              59,
              62,
              65,
              68,
              71,
              74,
              77,
              79,
              82,
              85,
              88,
              91,
              94,
              97,
              99,
              102,
              105,
              108,
              111,
              114,
              117,
              119,
              122,
              125,
              127,
              null
            ],
            "afterTouchConfig": [
              0,
              2,
              3,
              5,
              6,
              8,
              9,
              10,
              12,
              13,
              14,
              16,
              17,
              18,
              20,
              21,
              22,
              24,
              25,
              26,
              27,
              28,
              30,
              31,
              32,
              33,
              34,
              36,
              37,
              38,
              39,
              40,
              41,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              85,
              86,
              87,
              88,
              89,
              90,
              91,
              92,
              92,
              93,
              94,
              95,
              96,
              97,
              98,
              99,
              99,
              100,
              101,
              102,
              103,
              104,
              104,
              105,
              106,
              107,
              108,
              109,
              110,
              111,
              112,
              112,
              113,
              114,
              115,
              116,
              116,
              117,
              118,
              119,
              120,
              120,
              121,
              122,
              123,
              123,
              124,
              125,
              126,
              126,
              127,
              0,
              null
            ]
          };
        
        
        
    }

    get data() {
        return this.mapping;
    }

    loadFile(htmlFileInfo) {
        const name = htmlFileInfo.name;
        console.log('loading ' + name);

        let file = new FileReader();
        file.onload = (fileData) => {      
            if (fileData == null)
                throw new Error("unable to read file");
    
            this.mapping = parseLtn(fileData.target.result);
            console.log(this.mapping)

            refreshColor();
            renderToCanvas();
        };

        file.readAsText(htmlFileInfo);
    }
};

export let currentLtn = new LtnMapping();