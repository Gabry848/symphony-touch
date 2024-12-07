const {
    app,
    BrowserWindow,
    ipcMain,
    Tray,
    nativeImage,
} = require("electron");
const path = require("path");
const { Howl } = require("howler");
const fs = require("fs");

const music = require("./scripts/music");

let win;

function createWindow() {
    win = new BrowserWindow({
        height: 630,
        width: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        //icon: path.join(__dirname, 'assets', 'img', 'icon.png'),
        title: "MusicPlayer",
        frame: false,
    });

    win.setTitle("MusicPlayer");
    win.loadFile("app\\renderer\\html\\index.html");

    //win.webContents.openDevTools();
    win.on("minimize", (event) => {
        event.preventDefault();
        win.setSkipTaskbar(true);
    });
}

app.whenReady().then(() => {
    createWindow();
    let icon = nativeImage.createFromPath(
        "app\\renderer\\assets\\image\\icons\\logo.png"
    );
    let tray = new Tray(icon);
    tray.setTitle("MusicPlayer");
    tray.setToolTip("MusicPlayer");
    tray.on("double-click", () => {
        win.show();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// window control
ipcMain.on("window:minimize", (e) => {
    win.minimize();
});
ipcMain.on("window:restore", (e) => {
    if (win.isMaximized()) {
        win.restore();
    } else {
        win.maximize();
    }
});
ipcMain.on("window:close", (e) => {
    win.close();
});

// music player

ipcMain.on("get-audio-list", (e) => {
    let audioList = [];
    let audioPath = path.join("app\\shared\\music.json");
    fs.readFile(audioPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading music.json:", err);
            return;
        }
        try {
            audioList = JSON.parse(data);
            e.reply("get-audio-list", {
                audioList: audioList || [],
            });
        } catch (parseErr) {
            console.error("Error parsing music.json:", parseErr);
        }
    });
});

// add music
ipcMain.on("select-file", (e, path) => {
    music.addMusic(win);
});