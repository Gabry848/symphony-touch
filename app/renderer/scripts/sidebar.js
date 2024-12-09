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
        console.log(audio.duration());
        /**
         * Creates a new div element to represent a song.
         * @type {HTMLDivElement}
         */
        const song = document.createElement("div");
        song.classList.add("song");
        song.addEventListener("click", () => {
            playList.playIndex(playList.audioList.indexOf(audio));
        });

        let title = path.basename(audio._src) || "Unknown";
        let minutes = Math.round(audio.duration() / 60);
        let second = Math.round(audio.duration() % 60);
        song.innerHTML = `
                    <div class="song-index" >${index + 1})</div>
                    <div class="song-title" title="${title}">${truncateString(
            title,
            15
        )}</div>
                    <div class="song-duration">${minutes}min ${second}s</div>
                `;
        song.classList.add("item");
        songList.appendChild(song);
        index++;
    });
    console.log("All files loaded");
};

module.exports.clearSidebar = (songList) => {
    songList.innerHTML = "";
};

module.exports.higlightElement = (songList) => {
    
};
