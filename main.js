const fs = require("fs");

const symbols = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

const PATH = {
    rawText: "./rawText.txt",
    preparedText: "./result/preparedText.txt",
    encryptedText: "./result/encryptedText.txt",
    symbolStat: "./result/symbolStat.txt",
    cipherKey: "./result/cipherKey.txt",
    symbolStatCiphered: "./result/symbolStatCiphered.txt",
    resultStat: "./result/resultStat.txt", 
}

function getRandomInt(min, max, notArray = []){
    let result;
    do result = Math.floor(Math.random() * (max - min)) + min;
    while(notArray.includes(result))
    return result;
}
  
function getRandomSymbol(symbols, notArray = []){
    let result;
    do result = symbols[getRandomInt(0, symbols.length)];
    while(notArray.includes(result))
    return result;
}

function getText(path){
    return fs.promises.readFile(path, { encoding: "utf-8" });
}

async function writeText(path, data, consoleMessage = ""){
    fs.promises.access(path, fs.constants.F_OK)
        .then(() => {})
        .catch(() => fs.promises.writeFile(path, data))
        .then(() =>  { if(consoleMessage) console.log(consoleMessage) })
}

async function analyzeText(){
    const text = (await getText(PATH.preparedText)).toString();
    let result = {};
    for(let s of text){
        if(s in result)
            result[s]++;
        else
            result[s] = 1;
    }
    writeText(PATH.symbolStat, JSON.stringify(result), "symbolStat writed");
}

async function textPrepare(){
    const text = (await getText(PATH.rawText)).toString()
        .toUpperCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-—_`~()»«?]/g,"")
        .replace(/\s+/g, "")
        .replace(/Ё/g, "Е")
        .replace(/Й/g, "И")
        .replace(/Ъ/g, "Ь")
    writeText(PATH.preparedText, text, "preparedText writed");
}

async function generateKey(){
    let key = {};
    let stat = JSON.parse((await getText(PATH.symbolStat)).toString());
    
    for(let sym in stat){
        key[sym] = getRandomSymbol(symbols, Object.values(key));
    }

    writeText(PATH.cipherKey, JSON.stringify(key), "cipherKey writed");
}

async function getCipheredStat(){
    let cipheredStat = {};
    let stat = JSON.parse((await getText(PATH.symbolStat)).toString());
    let key = JSON.parse((await getText(PATH.cipherKey)).toString());
    for(let s in stat){
        cipheredStat[key[s]] = stat[s];
    }
    writeText(PATH.symbolStatCiphered, JSON.stringify(cipheredStat), "cipheredStat writed");
}

async function getResultStat(){
    let stat = JSON.parse((await getText(PATH.symbolStatCiphered)).toString());
    let result = {len: Object.values(stat).reduce((prev, cur) => prev + cur)};
    result.index = Number((Object.values(stat).reduce((prev, cur) => prev + cur*(cur-1), 0) / (result.len * (result.len-1))).toFixed(4));
    result.symbols = [];
    for(let s in stat){
        result.symbols.push({[s]: Number((stat[s] / result.len).toFixed(4))});
    }
    result.symbols.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
    writeText(PATH.resultStat, JSON.stringify(result), "resultStat writed");
}

async function encryptText(){
    let result = [];
    const text = (await getText(PATH.preparedText)).toString();
    let key = JSON.parse((await getText(PATH.cipherKey)).toString());

    for(let s of text){
        result.push(key[s]);
    }

    writeText(PATH.encryptedText, result.join(""), "encryptedText writed");
}
