const electron = require("electron");
var app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

var storage = require("./storage.js");

let win;
let debug;

function createWindow() {

    var lastWindowState = storage.get("lastWindowState");

    if(lastWindowState === null) {
        lastWindowState = {
            width: 800,
            height: 600,
            maximixed: false,
            debug: true
        }
    }
    win = new BrowserWindow({
        //x: lastWindowState.x,
        //y: lastWindowState.y,
        //width: lastWindowState.width, 
        //height: lastWindowState.height,
        fullscreen: true,
        frame: false
    });

    win.setMenu(null);
        
    debug = lastWindowState.debug;

    if (lastWindowState.maximized) {
        win.maximize();
        win.setFullScreen(true);
    }

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slaches: true
    }));

    if (debug) {
        win.webContents.openDevTools();
    }
    

    win.on('close', function() {

        if ((win.outerHeight - win.innerHeight) > 100) {
            debug = true;
            console.log("Debug is ON");            
        }
        else {
            debug = false;
        }
     
        var bounds = win.getBounds();
        storage.set("lastWindowState", {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            maximixed: win.isFullScreen(),
            debug: debug
        });
    });

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});