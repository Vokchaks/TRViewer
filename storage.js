let fs = require('fs');
let path = require('path');
let data = null;
//let dataFilePath = path.join(app.getPath('userData'), 'data.json'); 
let dataFilePath = path.join(__dirname, 'data.json'); 

function load() {
    if (data !== null) {
        return;
    } 

    if (!fs.existsSync(dataFilePath)) {
        data = {};
        return;
    }

    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8')); 
}

function save() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data)); 
}

exports.set = function (key, value) {
    load();
    data[key] = value; 
    save();
}

exports.get = function (key) { 
    load();
    var value = null;
    if (key in data) {
        value = data[key];
    } 
    return value;
}

exports.unset = function (key) { 
    load();
    if (key in data) {
        delete data[key];
        save();
    }
}