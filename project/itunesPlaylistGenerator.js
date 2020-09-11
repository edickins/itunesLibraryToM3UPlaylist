const fs = require("fs");
const path = require("path");
const { resolve } = require("path");

exports.getPlaylists = (fileToLoad) => {
  console.log("ITL.readFile " + fileToLoad);

  return new Promise((resolve, reject) => {

    let playlists = [];

    let itunes = require("itunes-data"),
      parser = itunes.parser(),
      stream = fs.createReadStream(path.resolve(__dirname, fileToLoad));

      stream.on("error", (err) => {
        console.error(err);
        let msg = "There was an error with reading the file";
        reject(new Error(msg));
      });

      parser.on("playlist", (playlist) => {
        //console.log("playlist " + playlist.Name);
        playlists.push(playlist);
      });

      stream.on("end", () => {
        console.log("getPlaylists finished");
        resolve(playlists);
      });

    stream.pipe(parser);
  });
};

exports.getLibraryAsJson = (fileToLoad) => {
  console.log("ITL.getLibraryAsJson " + fileToLoad);

  return new Promise((resolve, reject) => {
    // variable holders
    let libraryAsJSON = null;

    let itunes = require("itunes-data"),
      parser = itunes.parser(),
      stream = fs.createReadStream(path.resolve(__dirname, fileToLoad));

      stream.on("error", (err) => {
        let msg = "There was an error reading the file";
        reject(new Error(msg));
        console.error(err);
      });

      parser.on("library", (library) => {
        libraryAsJSON = library;
      });

      stream.on("end", () => {
        console.log("getLibraryAsJson finished");
        resolve(libraryAsJSON);
      });

    stream.pipe(parser);
  });
};
