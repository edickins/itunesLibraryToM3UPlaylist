const fs = require("fs");
const path = require("path");
const { resolve } = require("path");

exports.getLibraryAsJson = (fileToLoad) => {
  console.log("ITPLG.getLibraryAsJson " + fileToLoad);

  return new Promise((resolve, reject) => {
    let libraryAsJSON = null;

    const itunes = require("itunes-data"),
      parser = itunes.parser();
    let stream = fs.createReadStream(path.resolve(__dirname, fileToLoad));

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
