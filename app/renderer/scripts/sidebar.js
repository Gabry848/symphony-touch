const { ipcMain, ipcRenderer } = require("electron");
const path = require("path");

module.exports = {};

function truncateString(str, maxLength) {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + "...";
    }
    return str;
}

/**
 * Adds songs to the sidebar from the given playlist.
 *
 * @param {Object} playList - The playlist object containing the audio list.
 * @param {Array} playList.audioList - The list of audio objects in the playlist.
 * @param {Function} playList.playIndex - Function to play a song at a given index in the playlist.
 */
module.exports.addSongsToSidebar = (playList, songList) => {
    let index = 0;
    playList.audioList.forEach((audio) => {
        /**
         * Creates a new div element to represent a song.
         * @type {HTMLDivElement}
         */
        const song = document.createElement("div");
        song.classList.add("song");

        let title = path.basename(audio._src) || "Unknown";
        let minutes = Math.round(audio.duration() / 60);
        let second = Math.round(audio.duration() % 60);
        song.innerHTML = `
        <div class="song-box">
            <div class="song-title" title="${title}">${truncateString(
                title,
                15
            )}</div>
            <div class="song-duration">${minutes}:${second}</div> 
        </div>
        <div class="song-delete"><img src="../assets/image/icons/trash.png"class="delete-icon" />
        </div>`;
        const deleteButton = song.querySelector(".song-delete");
        deleteButton.addEventListener("click", (event) => {
            //event.stopPropagation();
            ipcRenderer.send("audio:delete", audio._src);
            console.log(`Deleting song: ${title}`);
        });
        const songBox = song.querySelector(".song-box");
        songBox.addEventListener("click", () => {
            playList.playIndex(playList.audioList.indexOf(audio));
        });

        song.classList.add("item");
        songList.appendChild(song);
        index++;
    });
};

module.exports.clearSidebar = (songList) => {
    songList.innerHTML = "";
};

module.exports.higlightElement = (songList, index) => {
    let songs = songList.getElementsByClassName("item");
    for (let song of songs) {
        song.classList.remove("playing");
    }
    if (songs.length > 0) {
        songs[index].classList.add("playing");
    }
};
