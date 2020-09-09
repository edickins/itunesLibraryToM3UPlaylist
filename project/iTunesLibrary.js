const fs = require("fs");
const path = require("path");

let writeLibraryToFile = true;
let libraryAsXML = "";

function writeLibraryToJSON(library) {
  console.log("writeLibraryToFile");
  if (!writeLibraryToFile) return;
  if (library) {
    writeLibraryToFile = false;
    let libraryAsJSONString = JSON.stringify(library);
    fs.writeFile(
      path.resolve(__dirname, "./data/itunes_music_library.json"),
      libraryAsJSONString,
      (err) => {
        if (err) {
          throw err;
        }
        console.log("Library File written");
        writeAlbumsToJSON();
        writePlaylistsToJSON();
      }
    );
  } else {
    console.error("writeLibraryToJSON : library undefined");
  }
}

function writePlaylistsToJSON() {
  console.log("writePlaylistsToJSON");
  if (playlists) {
    let libraryAsJSONString = JSON.stringify(playlists);
    fs.writeFile(
      path.resolve(__dirname, "./data/itunes_playlists.json"),
      libraryAsJSONString,
      (err) => {
        if (err) {
          throw err;
        }
        console.log("Playlist File written");
      }
    );
  } else {
    console.error("writePlaylistsToJSON : playlists undefined");
  }
}

function writeAlbumsToJSON() {
  let albums = createAlbumList();
  if (albums) {
    let albumsAsJSONString = JSON.stringify(albums);
    fs.writeFile(
      path.resolve(__dirname, "./data/itunes_albums.json"),
      albumsAsJSONString,
      (err) => {
        if (err) {
          throw err;
        }
        console.log("Albums File written");
      }
    );
  } else {
    console.error("writeAlbumsToJSON : albums undefined");
  }
}

function cleanTrackData(trackInfoObj) {
  if (trackInfoObj) {
    if (!trackInfoObj["Sort Name"]) {
      trackInfoObj["Sort Name"] = trackInfoObj["Name"] || "Untitled";
    }

    if (!trackInfoObj["Sort Album"]) {
      trackInfoObj["Sort Album"] = trackInfoObj["Album"] || "Unknown Album";
    }

    if (!trackInfoObj["Sort Artist"]) {
      trackInfoObj["Sort Artist"] = trackInfoObj["Artist"] || "Unknown Artist";
    }

    trackInfoObj = removeUnusedAlbumDataFromTrackInfo(trackInfoObj);
    return trackInfoObj;
  } else {
    console.log("cleanTrackData : trackInfoObj undefined");
  }
}

function removeUnusedAlbumDataFromTrackInfo(trackInfoObj) {
  if (trackInfoObj) {
    const removeFields = [
      "Date Modified",
      "Date Added",
      "Bit Rate",
      "Sample Rate",
      "Play Count",
      "Play Date",
      "Play Date UTC",
      "Skip Count",
      "Skip Date",
      "Rating",
      "Rating Computed",
      "Persistent ID",
      "Track Type",
      "File Folder Count",
      "Library Folder Count",
      "Composer",
      "Kind",
      "Location",
    ];

    for (let i = 0; i < removeFields.length; i++) {
      let field = removeFields[i];
      delete trackInfoObj[field];
    }

    return trackInfoObj;
  } else {
    console.error(
      "removeUnusedAlbumDataFromTrackInfo : trackInfoObj undefined"
    );
  }
}

function createAlbumList() {
  let pathToLibraryJson = path.resolve(
    __dirname,
    "./data/itunes_music_library.json"
  );
  if (fs.existsSync(pathToLibraryJson)) {
    let contents = fs.readFileSync(pathToLibraryJson);
    let jsonContents = JSON.parse(contents);
    if (jsonContents.Tracks) {
      let trackIDs = Object.keys(jsonContents.Tracks);
      let trackData = [];

      if (trackIDs && trackIDs.length > 0) {
        for (let i = 0; i < trackIDs.length; i++) {
          let trackID = trackIDs[i];
          let trackInfo = jsonContents.Tracks[trackID];
          trackData.push(cleanTrackData(trackInfo));
        }
      }

      let groupBy = require("json-groupby");
      return groupBy(trackData, ["Sort Album"]);
    }
  } else {
    console.log("createAlbumList : no itunes music library.json file");
  }
}

exports.getPlaylists = (fileToLoad) =>
{
  console.log("ITL.readFile " + fileToLoad);

  playlists = [];

  let itunes = require("itunes-data"),
    parser = itunes.parser(),
    stream = fs.createReadStream(path.resolve(__dirname, fileToLoad));

  stream.on("error", (err) => {
    console.error(err);
  });

  parser.on("playlist", (playlist) => {
    console.log("playlist " + playlist.Name);
    playlists.push(playlist);
  });

  parser.on("library", (library) => {
    libraryAsXML = library;
  });

  stream.on("end", () => {
    console.log("all finished");
    return playlists;
  });

  stream.pipe(parser);
}

exports.readAll = (fileToLoad) => {
  console.log("Reading all itunes library content as a stream");

  playlists = [];

  let itunes = require("itunes-data"),
    parser = itunes.parser(),
    stream = fs.createReadStream(path.resolve(__dirname, fileToLoad));

  stream.on("error", (err) => {
    console.error(err);
  });

  parser.on("track", (track) => {
    //console.log("track : " + track.Name);
  });

  parser.on("playlist", (playlist) => {
    console.log("playlist " + playlist.Name);
    playlists.push(playlist);
  });

  parser.on("library", (library) => {
    libraryAsXML = library;
  });

  stream.on("end", () => {
    console.log("all finished");
    if (writeLibraryToFile) {
      writeLibraryToJSON(libraryAsXML);
    }
  });

  stream.pipe(parser);
};
