const iTunesLibrary = require("./itunesPlaylistGenerator.js");
const fs = require("fs");
const path = require("path");
const { resolve } = require("path");

let playlists = [];
let library = {};

function getTrackData(trackID) {
  let trackObj = library.Tracks[trackID];
  if (trackObj) {
    return trackObj;
  }
}

function cleanPathToFile(pathToFile) {
  pathToFile = pathToFile || "";
  pathToFile = String(pathToFile);
  var n = pathToFile.lastIndexOf("/");
  if (n > -1) {
    pathToFile = pathToFile.substring(n + 1);
    pathToFile = pathToFile.replace(/%20/g, " ");
  }
  return pathToFile;
}

function createPlaylistData(playlist) {
  let items = playlist["Playlist Items"] || [];
  let returnStr = "#EXTM3U\n";

  for (let i = 0; i < items.length; i++) {
    let element = items[i];
    if (element) {
      let trackObj = getTrackData(element["Track ID"]);
      if (trackObj) {
        returnStr +=
          "#EXTIF:" +
          trackObj["Total Time"] +
          ", " +
          trackObj["Artist"] +
          " - " +
          trackObj["Name"] +
          "\n";

        let pathToFile = cleanPathToFile(trackObj["Location"]);
        returnStr += pathToFile + "\n";
      }
    } else {
      console.log("no element found");
    }
  }  
  return returnStr;
}

function createPlaylistSongData(item, returnStr) {
  if (item) {
    let trackObj = getTrackData(item["Track ID"]);
    if (trackObj) {
      returnStr +=
        "#EXTIF:" +
        trackObj["Total Time"] +
        ", " +
        trackObj["Artist"] +
        " - " +
        trackObj["Name"] +
        "\n";

      let pathToFile = cleanPathToFile(trackObj["Location"]);
      console.log(pathToFile);
      returnStr += pathToFile + "\n";
    }
  }
  return returnStr;
}

function loadPlaylists() {
  // Start calling async loading methods returning Promises
  iTunesLibrary
    .getLibraryAsJson("./data/iTunesLibrary.xml")
    .then((libraryJsonObj) => {
      library = libraryJsonObj;
      //writeLibraryToJson(library)
      iTunesLibrary
        .getPlaylists("./data/iTunesLibrary_less_artists.xml")
        .then((itunesPlaylists) => {
          console.log("There are " + itunesPlaylists.length + " playlists");
          playlists = itunesPlaylists;
          writePlaylistsToFile(playlists);
        });
    });
}

function writeDataToFile(fileData, folderName, fileName, fileExtension) {
  if (folderName.indexOf("/") == -1) {
    folderName = folderName + "/";
  }
  fs.writeFile(
    path.resolve(__dirname, "./data/" + folderName + fileName + fileExtension),
    fileData,
    (err) => {
      if (err) {
        throw err;
      }
      console.log("Playlist File written");
    }
  );
}

function writePlaylistsToFile(playlists) {
  playlists.forEach((playlist) => {
    writePlaylist(playlist);
  });
}

function writePlaylist(playlist) {
  let playlistData = createPlaylistData(playlist);
  let playlistName = String(playlist.Name);
  playlistName = playlistName.replace(/:/g, " - ");
  writeDataToFile(playlistData, "playlists", playlistName, ".m3u");
}

function writeLibraryToJson(library) {
  let libraryDataAsJson = JSON.stringify(library);
  writeDataToFile(libraryDataAsJson, "library", "libraryAsJson", ".json");
}

loadPlaylists();
