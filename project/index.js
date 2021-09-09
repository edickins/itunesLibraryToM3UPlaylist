const iTunesLibrary = require("./itunesPlaylistGenerator.js");
const fs = require("fs");
const path = require("path");

let playlists = [];
let library = {};

async function getLibraryAsJson(path) {
  const library = await iTunesLibrary.getLibraryAsJson(path);
  return library;
}

async function getPlaylists(library) {
  return library.Playlists;
}

function getPlaylistData(playlistObj, tracks) {
  const items = playlistObj["Playlist Items"] || [];

  return items.map((value) => {
    return getTrackData(value, tracks);
  });
}

function getTrackData(trackObj, tracks) {
  const track = tracks[trackObj["Track ID"]];
  /* for (key in track) {
    if (key.indexOf(" ") > -1) {
      console.log(`key ${key} contains a space`);
    }
  } */
  //console.log(`${track["Name"]} by ${track["Artist"]}`);
  return track;
}

async function run() {
  const libraryObj = await getLibraryAsJson("./data/iTunesLibrary.xml");
  const playlists = await getPlaylists(libraryObj);

  playlists.forEach((playlistObj) => {
    const tracks = getPlaylistData(playlistObj, libraryObj.Tracks);
    console.log(playlistObj);
  });
  console.log(`there are ${playlists.length} playlists`);
}

run();
