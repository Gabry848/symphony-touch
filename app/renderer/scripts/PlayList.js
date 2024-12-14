const { ipcRenderer } = require("electron");
const Howler = require("howler");

class PlayList {
    /**
     * Creates a new PlayList object.
     *
     * @param {boolean} random - Boolean indicating whether to enable or disable random playback.
     * @param {boolean} loop - Boolean indicating whether to enable or disable loop playback.
     *
     * @description
     * The PlayList class is used to manage a list of audio files and play them in sequence.
     * The class uses the Howler library to play audio files.
     *
     */
    constructor(random = false, loop = false) {
        this.audioList = [];
        this.index = 0;
        this.loop = loop;
        this._random = random;
        this.onPlay = () => {};
        this.onPause = () => {};
    }

    /**
     * Retrieves a list of audio files and creates Howler.Howl objects for each audio file.
     *
     * @param {Function} onEndFunction - Function to call when the audio finishes.
     *
     * @description
     * This function sends an IPC message to request the list of audio files.
     * For each audio file path received, it creates a new Howler.Howl object and adds it to the audioList array.
     *
     * Each Howler.Howl object is configured with:
     * - `src`: The source path of the audio file.
     * - `html5`: Boolean indicating if HTML5 Audio should be used.
     * - `onloaderror`: Callback function that handles errors during the loading of the audio file.
     * - `onend`: Callback function that logs a message when the audio ends.
     *
     * If an error occurs during the loading of an audio file, an IPC message is sent with the error details.
     */
    getAudioList(list, onEndFunction = () => {}, myonLoad = () => {}) {
        for (let i = 0; i < list.length; i++) {
            let audioPath = list[i];

            // aggiungo alla lista un nuovo oggetto Howler.howl
            this.audioList.push(
                new Howler.Howl({
                    src: [audioPath],
                    html5: true,
                    volume: 1,
                    onload: () => {
                        // se ha caricato tutti i file allora richiama la funzione di callback
                        if (i == list.length - 1) {
                           myonLoad();
                        }
                    },
                    onloaderror: (id, error) => {
                        console.error(
                            `Errore nel caricamento del file: ${error}`
                        );
                        ipcRenderer.send("audio-error", {
                            audioPath: audioPath,
                            error: error,
                        });
                    },
                    onend: () => {
                        console.log("Audio ended");
                        onEndFunction();
                        this.onAudioEnded();
                    },
                })
            );
        }
        this.loadAll();
    }

    loadAll() {
        this.audioList.forEach((audio) => {
            audio.load();
        });
    }

    /*play audio*/
    play() {
        this.audioList.forEach((audio, i) => {
            audio.pause();
            if (i == this.index) {
                audio.play();
            }
        });
        // function di callback
        this.onPlay();
    }

    playIndex(index) {
        this.index = index;
        this.playPause();
    }

    playPause() {
        if (this.index >= this.audioList.length) {
            console.log("No audio files loaded");
            return;
        }
        try {
            if (this.audioList[this.index].playing()) {
                this.audioList[this.index].pause();
                this.onPause();
            } else {
                this.play();
            }
        } catch (e) {
            this.play();
        }
    }

    /*internal function to handle audio ended event*/
    onAudioEnded() {
        if (this.random) {
            this.index = Math.floor(Math.random() * this.audioList.length);
        } else {
            this.index += 1;
            if (this.index >= this.audioList.length) {
                this.index = 0;
            }
        }

        if (this.loop) {
            this.play();
        }
    }

    addSong(audioPath, myOnLoad = () => {}) {
        this.audioList.push(
            new Howler.Howl({
                src: [audioPath],
                html5: true,
                volume: 1,
                onload: () => {
                    console.log("File caricato");
                    myOnLoad();
                },
                onloaderror: (id, error) => {
                    console.error(
                        `Errore nel caricamento del file: ${error}`
                    );
                    ipcRenderer.send("audio-error", {
                        audioPath: audioPath,
                        error: error,
                    });
                },
                onend: () => {
                    console.log("Audio ended");
                    this.onAudioEnded();
                },
            })
        );
    }

    removeSong(audiopath, callback = () => {}) {
        this.audioList = this.audioList.filter((audio) => {
            if (audio._src != audiopath) {
                return true;
            }
            audio.pause();
            audio.unload();
            return false;
        });
        if (this.index >= this.audioList.length) {
            this.index = 0;
        } 
        this.play()

        callback();
    }

    playNext(){
        if (this.index >= this.audioList.length-1){
            this.index = 0
        } else {
           this.index++; 
        }
        this.play()
    }

    playPrevious(){
        if (this.index <= 0){
            this.index = this.audioList.length-1
        } else {
            this.index--;
        }
        this.play()
    }

    get currentTime() {
        return this.audioList[this.index].seek();
    }

    get audio() {
        return this.audioList[this.index];
    }

    get duration() {
        return this.audioList[this.index].duration();
    }

    get playing() {
        try {
            return this.audioList[this.index].playing();
        } catch (e) {
            return false;
        }
    }

    get random() {
        return this._random;
    }

    set random(value) {
        this._random = value;
    }

}

module.exports = PlayList;
