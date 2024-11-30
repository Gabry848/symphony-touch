const ffmpeg = require("fluent-ffmpeg");

module.exports = {};

module.exports.play = (path) => {
  const process = ffmpeg(path)
    .audioFilters("volume=0.5") // Regola il volume
    .format("mp3") // Formato di output
    .on("end", () => {
      console.log("Musica terminata");
    })
    .on("error", (err) => {
      console.log("Errore:", err);
    })
    .pipe();
};
