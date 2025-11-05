class ProgressBar {
    constructor(playList) {
        this.playList = playList;
        this.duration = 0;
        this.progressBar = document.getElementById("seek-bar");
        this.sArea = document.getElementById("s-area");
        this.trackLength = document.getElementById("track-length");
        this.currentTime = document.getElementById("current-time");
        this.insTime = document.getElementById("ins-time");
        this.sHover = document.getElementById("s-hover");
        this.trackTime = document.getElementById("track-time");
        this.isUpdating = false;

        this.setupInteractivity();
    }

    setupInteractivity() {
        // Click sulla seekbar per navigare
        this.sArea.addEventListener("click", (e) => {
            const rect = this.sArea.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const seekTo = percent * this.playList.duration;
            this.playList.audio.seek(seekTo);
        });

        // Hover sulla seekbar per mostrare tempo
        this.sArea.addEventListener("mousemove", (e) => {
            const rect = this.sArea.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const hoverTime = percent * this.playList.duration;

            const hoverMin = Math.floor(hoverTime / 60);
            const hoverSec = Math.floor(hoverTime % 60);
            const formattedSec = hoverSec < 10 ? `0${hoverSec}` : hoverSec;

            this.insTime.innerText = `${hoverMin}:${formattedSec}`;
            this.insTime.style.left = `${e.clientX - rect.left}px`;
            this.insTime.style.display = "block";

            this.sHover.style.width = `${percent * 100}%`;
        });

        this.sArea.addEventListener("mouseleave", () => {
            this.insTime.style.display = "none";
            this.sHover.style.width = "0";
        });
    }

    updateProgressBar() {
        if (this.playList.playing && this.playList.audio) {
            const currentTime = this.playList.currentTime;
            const duration = this.playList.duration;
            const progress = (currentTime / duration) * 100;
            this.progressBar.style.width = progress + "%";
        }
    }

    updateTrackTime() {
        if (!this.playList.audio) return;

        const currentTime = this.playList.currentTime;
        const duration = this.playList.duration;

        const durationMin = Math.floor(duration / 60);
        const durationSec = Math.floor(duration % 60);
        const currentMin = Math.floor(currentTime / 60);
        const currentSec = Math.floor(currentTime % 60);

        const formattedDurationSec = durationSec < 10 ? `0${durationSec}` : durationSec;
        const formattedCurrentSec = currentSec < 10 ? `0${currentSec}` : currentSec;

        this.trackLength.innerText = `${durationMin}:${formattedDurationSec}`;
        this.currentTime.innerText = `${currentMin}:${formattedCurrentSec}`;
    }

    update() {
        if (!this.isUpdating) return;

        this.updateProgressBar();
        this.updateTrackTime();

        requestAnimationFrame(this.update.bind(this));
    }

    start() {
        this.isUpdating = true;
        this.duration = this.playList.duration;
        this.trackTime.classList.add("active");
        this.update();
    }

    stop() {
        this.isUpdating = false;
        this.trackTime.classList.remove("active");
    }
}

module.exports = ProgressBar;
