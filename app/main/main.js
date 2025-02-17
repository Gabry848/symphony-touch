const { app, BrowserWindow, ipcMain, Tray, nativeImage } = require("electron");
const path = require("path");
const { exec } = require("youtube-dl-exec");
const fs = require("fs");

const MusicManager = require("./scripts/music");

//gestione musica file json
let music = new MusicManager(
  app,
  (filePath) => {
    win.webContents.send("sidebar:addMusic", filePath);
  },
  (err) => {
    win.webContents.send("audio-error", { error: err });
  }
);

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
    title: "Symphony Touch",
    frame: false,
  });

  win.setTitle("Symphony Touch");
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
  tray.setTitle("Symphony Touch");
  tray.setToolTip("Symphony Touch");
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
  let audioPath = path.join(app.getPath("music"), "music.json");
  fs.readFile(audioPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading music.json:", err);
      fs.writeFile(audioPath, JSON.stringify([]), (writeErr) => {
        if (writeErr) {
          console.error("Error creating music.json:", writeErr);
        } else {
          e.reply("get-audio-list", {
            audioList: [],
          });
        }
      });
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

ipcMain.on("audio:delete", (e, audioPath) => {
  music.deleteFile(audioPath, (path) => {
    win.webContents.send("sidebar:deleteMusic", path);
  });
});

// add music
ipcMain.on("select-file", (e, path) => {
  music.addMusicFromDialog(win);
});

// Ascolta la richiesta dal renderer per scaricare un MP3
ipcMain.on("download-mp3", async (_, videoUrl, title) => {
  console.log("Download MP3 richiesto");

  try {
    await exec(videoUrl, {
      extractAudio: true,
      audioFormat: "mp3",
      output: path.join(app.getPath("music"), `${title}.mp3`),
    });

    console.log("Download completato");

    music.addFile(
      path.join(app.getPath("music"), `${title}.mp3`),
      null,
      (err) => {
        win.webContents.send("audio-error", { error: err });
        win.webContents.send("sidebar:reload");
      }
    );
  } catch (error) {
    win.webContents.send("audio-error", { error });
  }
});
