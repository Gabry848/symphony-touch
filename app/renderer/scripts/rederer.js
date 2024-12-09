const { ipcRenderer } = require("electron");

const PlayList = require("../scripts/PlayList.js");
const SideBar = require("../scripts/sidebar.js");

// event ipcrenderer per barra della finestra
let buttonmin = document.getElementById("minimaze");
let buttonres = document.getElementById("restore");
let buttonmax = document.getElementById("close");
let albumArt = document.getElementById("album-art");
let playerTrack = document.getElementById("player-track");
let albumName = document.getElementById("album-name");

const sidebar = document.getElementById("sidebar");
const container = sidebar.getElementsByClassName("container")[0];
const songList = container.getElementsByClassName("song-list")[0];

// playlist
// ipc renderer communication to get playlist
let myPlayList = new PlayList(false, true);

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
previous.addEventListener("click", ()=>{
    myPlayList.playPrevious()
})
// Aggiungi il listener per il click su app-cover
let playButton = document.getElementById("play-pause-button");
playButton.addEventListener("click", () => {
    myPlayList.playPause();
});
let next = document.getElementById('play-next')
next.addEventListener('click', ()=>{
    myPlayList.playNext()
})

// Aggiungi il listener per il click su app-cover (per aggiungere file)
document.getElementById("file").addEventListener("click", () => {
    ipcRenderer.send("select-file");
});

ipcRenderer.on("sidebar:reload", (event, path) => {
    SideBar.clearSidebar(songList);
    myPlayList.addSong(path, () => {
        SideBar.addSongsToSidebar(myPlayList, songList);
        console.log("sidebar reloaded");
    });
});
