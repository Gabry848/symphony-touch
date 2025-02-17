const { dialog } = require("electron");
const fsPromises = require("fs").promises;
const path = require("path");

class MusicManager {
	constructor(app, onSuccess = (filePath) => {}, onError = (e) => {}) {
		this.musicJsonPath = path.join(app.getPath("music"), "music.json");
		this.onSuccess = onSuccess;
		this.onError = onError;
	}

	// Read and parse the JSON file
	async readMusicList() {
		try {
			const data = await fsPromises.readFile(this.musicJsonPath, "utf8");
			return JSON.parse(data);
		} catch (error) {
			console.error("Errore nella lettura o parsing di music.json:", error);
			throw error;
		}
	}

	// Write updated music list to the JSON file
	async writeMusicList(musicList) {
		try {
			await fsPromises.writeFile(
				this.musicJsonPath,
				JSON.stringify(musicList, null, 2),
				"utf8"
			);
		} catch (error) {
			console.error("Errore nella scrittura di music.json:", error);
			throw error;
		}
	}

	// Aggiunge un file alla lista sul file JSON
	async addFile(filePath, customOnSuccess, customOnError) {
		// Usa le callback personalizzate se presenti, altrimenti quelle di default
		const onSuccess = customOnSuccess || this.onSuccess;
		const onError = customOnError || this.onError;

		try {
			const musicList = await this.readMusicList();
			if (musicList.includes(filePath)) {
				throw new Error("File gia` presente nella lista");
			}
			musicList.push(filePath);
			await this.writeMusicList(musicList);
			console.log("File JSON aggiornato con successo");
			onSuccess(filePath);
			return filePath;
		} catch (error) {
			onError(error);
			throw error;
		}
	}

	// Apre un dialog per selezionare un file e lo aggiunge alla lista
	async addMusicFromDialog(win) {
		try {
			const result = await dialog.showOpenDialog(win, {
				title: "Seleziona un file",
				buttonLabel: "Apri",
				properties: ["openFile"],
				filters: [
					{ name: "Documenti", extensions: ["mp3", "wav"] }
				],
			});
			if (result.canceled) {
				console.log("Operazione annullata");
				return;
			}
			const filePath = result.filePaths[0];
			return this.addFile(filePath);
		} catch (error) {
			this.onError(error);
			throw error;
		}
	}

	// Rimuove un file dalla lista sul file JSON
	async deleteFile(filePath, customOnSuccess, customOnError) {
		const onSuccess = customOnSuccess || this.onSuccess;
		const onError = customOnError || this.onError;
        
		try {
			const musicList = await this.readMusicList();
			const updatedMusicList = musicList.filter(musicPath => musicPath !== filePath);
			if (musicList.length === updatedMusicList.length) {
				throw new Error("File non trovato nella lista");
			}
			await this.writeMusicList(updatedMusicList);
			console.log("File JSON aggiornato con successo");
			onSuccess(filePath);
			return filePath;
		} catch (error) {
			onError(error);
			throw error;
		}
	}
}

module.exports = MusicManager;
