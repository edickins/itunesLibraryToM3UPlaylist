const iTunesLibrary = require("./itunesPlaylistGenerator.js");
const fs = require("fs");
const path = require("path");

let playlists = [];
let library = {};

async function getLibraryAsJson(path) {
  const library = await iTunesLibrary.getLibraryAsJson(path);
  return library;
}

function getPlaylists(library) {
  return library.Playlists;
}

function getPlaylistData(playlistObj, allTracks) {
  const items = playlistObj["Playlist Items"] || [];

  // return Array of playlist track data
  return items.map((value) => {
    return getTrackData(value, allTracks);
  });
}

function getTrackData(trackObj, allTracks) {
  const track = allTracks[trackObj["Track ID"]];
  //todo: format track data appropriately
  /* for (key in track) {
    if (key.indexOf(" ") > -1) {
      console.log(`key ${key} contains a space`);
    }
  } */

  if (track) {
    console.log(`${track["Name"]} by ${track["Artist"]}`);
    return track;
  }
}

async function run() {
  const libraryObj = await getLibraryAsJson("./data/iTunesLibrary.xml");
  const playlists = getPlaylists(libraryObj);

  playlists.forEach((playlistObj) => {
    // todo: use playlistTracks
    const playlistTracks = getPlaylistData(playlistObj, libraryObj.Tracks);
    console.log(playlistObj);
  });
  console.log(`there are ${playlists.length} playlists`);
}

run();
