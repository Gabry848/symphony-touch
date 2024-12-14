class ProgressBar {
    constructor(
        playList,
        track_lenght = "track-lenght",
        current_time = "current-time"
    ) {
        this.playList = playList;
        this.duration = 0;
        //this.progressBar = document.getElementById(progressbar);
        this.trackLength = document.getElementById(track_lenght);
        this.currentTime = document.getElementById(current_time);
    }

    updateProgressBar() {
        if (this.playList.playing) {
            let currentTime = this.playList.currentTime;
            let duration = this.playList.duration;
            let progress = (currentTime / duration) * 100;
            progressBar.style.width = progress + "%";
            this.progressBar.style.width = progress + "%";
        }
    }

    updateTrackTime() {
        let currentTime = this.playList.currentTime;
        console.log("Duration", duration);
        console.log("Current Time", currentTime);

        let durationMin = Math.floor(this.duration / 60);
        let durationSec = Math.floor(this.duration % 60);
        let currentMin = Math.floor(currentTime / 60);
        let currentSec = Math.floor(currentTime % 60);

        if (durationSec < 10) {
            durationSec = `0${durationSec}`;
        }
        if (currentSec < 10) {
            currentSec = `0${currentSec}`;
        }

        document.getElementById(
            "track-length"
        ).innerText = `${durationMin}:${durationSec}`;
        document.getElementById(
            "current-time"
        ).innerText = `${currentMin}:${currentSec}`;
    }

    update() {
        this.updateProgressBar();
        this.updateTrackTime();

        requestAnimationFrame(this.update.bind(this));
    }

    onPLaySong() {
        this.duration = this.playList.duration;
        this.update();
    }
}

module.exports = ProgressBar;
