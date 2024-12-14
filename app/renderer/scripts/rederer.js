const { ipcRenderer } = require("electron");
const path = require("path");

const PlayList = require("../scripts/PlayList.js");
const SideBar = require("../scripts/sidebar.js");
const errors = require("../scripts/errors.js");
const ProgressBar = require("../scripts/progressbar.js");


// event ipcrenderer per barra della finestra
let buttonmin = document.getElementById("minimaze");
let buttonres = document.getElementById("restore");
let buttonmax = document.getElementById("close");
let albumArt = document.getElementById("album-art");
let playerTrack = document.getElementById("player-track");
let albumName = document.getElementById("album-name");
let trackName = document.getElementById("track-name");
let playPauseButton = document
    .getElementById("play-pause-button")
    .querySelector("i");
let progressArea = document.getElementById("progress-area");
const sidebar = document.getElementById("sidebar");
const container = sidebar.getElementsByClassName("container")[0];
const songList = container.getElementsByClassName("song-list")[0];


// creo una playlist ed il tracker della barra di progresso
let myPlayList = new PlayList(false, true);
let MyProgressBar = new ProgressBar(myPlayList);

ipcRenderer.send("get-audio-list");
ipcRenderer.on("get-audio-list", (e, arg) => {
    let audioList = arg["audioList"];
    myPlayList.getAudioList(
        audioList,
        () => {},
        () => {
            setTimeout(() => {
                SideBar.addSongsToSidebar(myPlayList, songList);
            }, 500);
        }
    );
});
myPlayList.onPlay = () => {
    SideBar.higlightElement(songList, myPlayList.index);
    albumName.innerHTML =
        path.basename(myPlayList.audioList[myPlayList.index]._src) || "Unknown";
    trackName.innerHTML = "My playList";

    albumArt.classList.add("active");
    playerTrack.classList.add("active");

    playPauseButton.classList.remove("fa-play");
    playPauseButton.classList.add("fa-pause");

    // update progress bar
    //MyProgressBar.updateProgressBar();
    MyProgressBar.updateTrackTime();
};
myPlayList.onPause = () => {
    playerTrack.classList.remove("active");
    albumArt.classList.remove("active");

    playPauseButton.classList.remove("fa-pause");
    playPauseButton.classList.add("fa-play");
};

// gestione finestra
buttonmin.addEventListener("click", () => {
    ipcRenderer.send("window:minimize");
});
buttonres.addEventListener("click", () => {
    ipcRenderer.send("window:restore");
});
buttonmax.addEventListener("click", () => {
    ipcRenderer.send("window:close");
});

let previous = document.getElementById("play-previous");
previous.addEventListener("click", () => {
    myPlayList.playPrevious();
});
// Aggiungi il listener per il click su app-cover
let playButton = document.getElementById("play-pause-button");
playButton.addEventListener("click", () => {
    myPlayList.playPause();
});
let next = document.getElementById("play-next");
next.addEventListener("click", () => {
    myPlayList.playNext();
});

// Aggiungi il listener per il click su app-cover (per aggiungere file)
document.getElementById("file").addEventListener("click", () => {
    ipcRenderer.send("select-file");
});

ipcRenderer.on("sidebar:addMusic", (event, path) => {
    SideBar.clearSidebar(songList);
    if (path) {
        myPlayList.addSong(path, () => {
            SideBar.addSongsToSidebar(myPlayList, songList);
            SideBar.higlightElement(songList, myPlayList.index);
            console.log("sidebar reloaded");
        });
    } else {
        console.log("No path");
    }
});

ipcRenderer.on("sidebar:deleteMusic", (event, audioPath) => {
    SideBar.clearSidebar(songList);
    myPlayList.removeSong(audioPath, () => {
        SideBar.addSongsToSidebar(myPlayList, songList);
        SideBar.higlightElement(songList, myPlayList.index);
    });
});

ipcRenderer.on("audio-error", (event, arg) => {
    console.error(arg["error"]);
    errors.showError(arg["error"]);
});

