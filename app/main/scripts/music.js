const { dialog } = require("electron");
const fs = require("fs");
const path = require("path");

const { MUSIC_PATH } = require("../../shared/music.json");

module.exports = {
    // Funzioni e variabili da esportare
};

module.exports.addMusicInJson = (win, callback = ()=>{}) => {
    // apri una finestra per selezionare un file
    let result = dialog.showOpenDialog(win, {
        title: "Seleziona un file",
        buttonLabel: "Apri",
        properties: ["openFile"], // Altre opzioni: 'openDirectory', 'multiSelections'
        filters: [
            { name: "Documenti", extensions: ["mp3", "wav"] },
            // { name: "Tutti i file", extensions: ["*"] },
        ],
    });
    result.then((e) => {
        if (e.canceled) {
            console.log("cancelled");
            return;
        }

        const filePath = e.filePaths[0];
        fs.readFile("app\\shared\\music.json", "utf8", (err, data) => {
            if (err) {
                console.error("Errore nella lettura del file JSON:", err);
                return;
            }
            let musicList;
            try {
                musicList = JSON.parse(data);
            } catch (parseErr) {
                console.error("Errore nel parsing del file JSON:", parseErr);
                return;
            }

            // Aggiungi il nuovo filePath alla lista
            musicList.push(filePath);

            // Scrivi di nuovo il file JSON aggiornato
            fs.writeFile(
                "app\\shared\\music.json",
                JSON.stringify(musicList, null, 2),
                "utf8",
                (writeErr) => {
                    if (writeErr) {
                        console.error(
                            "Errore nella scrittura del file JSON:",
                            writeErr
                        );
                        return;
                    }
                    console.log("File JSON aggiornato con successo");
                    callback(filePath);
                }
            );
        });
    });
};
