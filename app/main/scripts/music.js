const { dialog } = require("electron");
const fs = require("fs");
const path = require("path");


module.exports.writeJson = (app, filePath, callback, onError)=> {
    console.log("writeJson");
    fs.readFile(path.join(app.getPath("music"), `music.json`), "utf8", (err, data) => {
        if (err) {
            console.error("Errore nella lettura del file JSON:", err);
            onError(err);
            return;
        }
        let musicList;
        try {
            musicList = JSON.parse(data);
        } catch (parseErr) {
            console.error("Errore nel parsing del file JSON:", parseErr);
            onError(parseErr);
            return;
        }

        // Verifica se il filePath è già presente nella lista
        if (musicList.includes(filePath)) {
            console.log("File gia` presente nella lista");
            onError("File gia` presente nella lista");
            return;
        }
        // Aggiungi il nuovo filePath alla lista
        musicList.push(filePath);

        // Scrivi di nuovo il file JSON aggiornato
        fs.writeFile(
            path.join(app.getPath("music"), `music.json`),
            JSON.stringify(musicList, null, 2),
            "utf8",
            (writeErr) => {
                if (writeErr) {
                    console.error(
                        "Errore nella scrittura del file JSON:",
                        writeErr
                    );
                    onError(writeErr);
                    return;
                }
                console.log("File JSON aggiornato con successo");
                callback(filePath);
            }
        );
    })
}
module.exports.addMusicInJson = (
    app,
    win,
    callback = () => {},
    onError = () => {}
) => {
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
        module.exports.writeJson(app, filePath, callback, onError);
    });
};

module.exports.deleteMusicInJson = (
    app,
    filePath,
    onLoad = () => {},
    onError = () => {}
) => {
    // elimina un file dalla lista json
    fs.readFile(path.join(app.getPath("music"), `music.json`), "utf8", (err, data) => {
        if (err) {
            console.error("Errore nella lettura del file JSON:", err);
            onError(err);
            return;
        }
        let musicList;
        try {
            musicList = JSON.parse(data);
        } catch (parseErr) {
            console.error("Errore nel parsing del file JSON:", parseErr);
            onError(parseErr);
            return;
        }

        // Rimuovi il filePath dalla lista
        const updatedMusicList = musicList.filter(
            (musicPath) => musicPath !== filePath
        );

        // Scrivi di nuovo il file JSON aggiornato
        fs.writeFile(
            path.join(app.getPath("music"), `music.json`),
            JSON.stringify(updatedMusicList, null, 2),
            "utf8",
            (writeErr) => {
                if (writeErr) {
                    console.error(
                        "Errore nella scrittura del file JSON:",
                        writeErr
                    );
                    onError(writeErr);
                    return;
                }
                console.log("File JSON aggiornato con successo");
                onLoad(filePath);
            }
        );
    });
};
