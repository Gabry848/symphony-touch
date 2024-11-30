const { app, BrowserWindow, ipcMain, Tray, nativeImage } = require('electron');
const path = require('path')

const music = require('./scripts/audio')
let win

function createWindow() {
    win = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            nodeIntegration: true,
            //enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js")
        },
        //icon: path.join(__dirname, 'assets', 'img', 'icon.png'),
        title: 'MusicPlayer',
        frame: false,
    });

    win.setTitle('MusicPlayer');
    win.loadFile('app\\renderer\\html\\index.html');

    win.on('minimize', (event) => {
        event.preventDefault()
        win.setSkipTaskbar(true)
    });
}

app.whenReady().then(()=>{
    createWindow()
    let icon = nativeImage.createFromPath("app\\renderer\\assets\\image\\icons\\logo.png")
    let tray = new Tray(icon)
    tray.setTitle("MusicPlayer")
    tray.setToolTip("MusicPlayer")
    tray.on("double-click", ()=>{
        win.show()
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


// window control
ipcMain.on("window:minimize", (e) => {
    win.minimize()
})
ipcMain.on("window:restore", (e) => {
    if (win.isMaximized()) {
        win.restore()
    } else {
        win.maximize()
    }
})
ipcMain.on("window:close", (e) => {
    win.close()
})


// music player

ipcMain.on("music:play", (e) => {
    console.log("play")
    
})

ipcMain.on("music:next", (e) => {  
    console.log("next")
})

ipcMain.on("music:previous", (e) => {  
    console.log("previous")
})