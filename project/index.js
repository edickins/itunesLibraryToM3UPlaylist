const fs = require("fs");
const path = require("path");
const iTunesLibrary = require("./modules/loaders/itunesPlaylistGenerator.js");
const {
  playlistIsBlocked,
  cleanObjKeys,
  getPlaylistData,
  createCollectionDoc,
} = require("./modules/utils/utils");

const BLOCKED_PLAYLISTS = [
  "Library",
  "Downloaded",
  "Music",
  "0 plays Playlist",
  "90’s Music",
  "Classical Music",
  "808 State DJs - Radio Show 1990",
  "808 State DJs - Radio Show 1991",
  "808 State DJs - Radio Show 1992",
  "r&s",
  "Music for Programming",
  "Gescom - Radio Show",
  "Garageband",
];

async function getLibraryAsJson() {
  // path relative to location of getLibraryAsJson function deinition.
  const path = "../../data/iTunesLibrary.xml";
  const library = await iTunesLibrary.getLibraryAsJson(path);
  return library;
}

function getPlaylistsFromLibrary(library) {
  const playlists = removeBlockedPlaylists(library.playlists);
  return playlists.map((playlist) => {
    return cleanObjKeys(playlist);
  });
}

function removeBlockedPlaylists(playlists) {
  return playlists.reduce((previousValue, nextValue) => {
    if (!playlistIsBlocked(nextValue, BLOCKED_PLAYLISTS)) {
      console.log(`adding playist to docs Array : ${nextValue.Name}`);
      previousValue.push(nextValue);
    }
    return previousValue;
  }, []);
}

function writePlaylistsToMongoDB(playlists) {
  const url = "mongodb://localhost:27017/iTunes";
  mongodb.connect(url, function (err, db) {
    const dbPlaylists = db.collection("playlists");
    const playlistsAll = [];

    dbPlaylists.find({}).toArray(function (err, results) {
      if (err) {
        console.log(err);
      } else {
        playlistsAll = results;
        log(`all playlists : ${playlistsAll}`);
      }
    });
  });
}

async function run() {
  let libraryObj = await getLibraryAsJson();
  libraryObj = cleanObjKeys(libraryObj);
  const playlists = getPlaylistsFromLibrary(libraryObj);
  const playlistsForDatabase = [];

  playlists.forEach((playlistObj) => {
    const playlistTracks = getPlaylistData(playlistObj, libraryObj.tracks);
    playlistsForDatabase.push(createCollectionDoc(playlistObj, playlistTracks));
    // todo: use playlistTracks
    /* if (playlistObj.name == "Popol Vuh Essentials") {
      console.log(`getting playlistdata for ${playlistObj.name}`);
      const playlistTracks = getPlaylistData(playlistObj, libraryObj.tracks);
      console.log(playlistTracks);
    } */
  });

  playlistsForDatabase.forEach((playlist) => {
    playlist.playlistItems.forEach((track) => {
      console.log(track.name);
    });
  });

  console.log(`there are ${playlistsForDatabase.length} playlists`);
}

run();
