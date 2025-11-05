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
        song.setAttribute("draggable", "true");
        song.dataset.index = index;

        let title = path.basename(audio._src) || "Unknown";
        let minutes = Math.round(audio.duration() / 60);
        let second = Math.round(audio.duration() % 60);
        const formattedSecond = second < 10 ? `0${second}` : second;

        song.innerHTML = `
        <div class="song-reorder">
            <div class="reorder-btn reorder-up" title="Sposta su">
                <i class="fas fa-chevron-up"></i>
            </div>
            <div class="reorder-btn reorder-down" title="Sposta giù">
                <i class="fas fa-chevron-down"></i>
            </div>
        </div>
        <div class="song-box">
            <div class="song-title" title="${title}">${truncateString(
                title,
                15
            )}</div>
            <div class="song-duration">${minutes}:${formattedSecond}</div>
        </div>
        <div class="song-delete"><img src="../assets/image/icons/trash.png"class="delete-icon" />
        </div>`;

        // Reorder buttons
        const reorderUp = song.querySelector(".reorder-up");
        const reorderDown = song.querySelector(".reorder-down");

        reorderUp.addEventListener("click", (event) => {
            event.stopPropagation();
            if (playList.moveTrackUp(index)) {
                module.exports.clearSidebar(songList);
                module.exports.addSongsToSidebar(playList, songList);
                module.exports.higlightElement(songList, playList.index);
            }
        });

        reorderDown.addEventListener("click", (event) => {
            event.stopPropagation();
            if (playList.moveTrackDown(index)) {
                module.exports.clearSidebar(songList);
                module.exports.addSongsToSidebar(playList, songList);
                module.exports.higlightElement(songList, playList.index);
            }
        });

        // Delete button
        const deleteButton = song.querySelector(".song-delete");
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            ipcRenderer.send("audio:delete", audio._src);
            console.log(`Deleting song: ${title}`);
        });

        // Song box click to play
        const songBox = song.querySelector(".song-box");
        songBox.addEventListener("click", () => {
            playList.playIndex(playList.audioList.indexOf(audio));
        });

        // Drag and drop functionality
        song.addEventListener("dragstart", (e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", song.innerHTML);
            song.classList.add("dragging");
        });

        song.addEventListener("dragend", (e) => {
            song.classList.remove("dragging");
        });

        song.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            const draggingElement = songList.querySelector(".dragging");
            if (draggingElement && draggingElement !== song) {
                const rect = song.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                if (e.clientY < midpoint) {
                    song.parentNode.insertBefore(draggingElement, song);
                } else {
                    song.parentNode.insertBefore(draggingElement, song.nextSibling);
                }
            }
        });

        song.addEventListener("drop", (e) => {
            e.preventDefault();
            const draggingElement = songList.querySelector(".dragging");
            if (draggingElement) {
                const fromIndex = parseInt(draggingElement.dataset.index);
                const toIndex = parseInt(song.dataset.index);

                if (playList.moveTrack(fromIndex, toIndex)) {
                    module.exports.clearSidebar(songList);
                    module.exports.addSongsToSidebar(playList, songList);
                    module.exports.higlightElement(songList, playList.index);
                }
            }
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
