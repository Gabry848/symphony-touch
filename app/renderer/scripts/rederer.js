const { ipcRenderer } = require("electron");

const PlayList = require("../scripts/PlayList.js");

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
var audioList = [];

// playlist
// ipc renderer communication to get playlist
let myPlayList = new PlayList(false, true);

ipcRenderer.send("get-audio-list");
ipcRenderer.on("get-audio-list", (e, arg) => {
    audioList = arg["audioList"];

    myPlayList.getAudioList(
        audioList,
        () => {},
        () => {
            console.log("All files loaded"); 
            let index = 0;
            myPlayList.audioList.forEach((audio) => {
                console.log(audio);
                console.log(audio.duration());
                console.log(index);
                const song = document.createElement("div");
                song.classList.add("song");
                song.addEventListener("click", () => {
                    myPlayList.playIndex(myPlayList.audioList.indexOf(audio));
                });
                song.innerHTML = `
                    <div class="song-index">${index}</div>
                    <div class="song-title">Title</div>
                    <div class="song-duration">${audio.duration()}</div>
                `;
                songList.appendChild(song);
                index++;
            });
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

// Aggiungi il listener per il click su app-cover
let playButton = document.getElementById("play-pause-button");
playButton.addEventListener("click", () => {
    myPlayList.playPause();
});

// Aggiungi il listener per il click su app-cover (per aggiungere file)
document.getElementById('file').addEventListener('click', () => {
    ipcRenderer.send('select-file');
});

// ipcRenderer.on('select-file', (event, path) => {
//     console.log(path);
//     ipcRenderer.send('add-music', path);
// });