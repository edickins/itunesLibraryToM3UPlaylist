const iTunesLibrary = require("./itunesPlaylistGenerator.js");
const fs = require("fs");
const path = require("path");

const trackProps = {
  albumArtist: true,
  album: true,
  artist: true,
  genre: true,
  name: true,
  sortAlbum: true,
  sortArtist: true,
  sortName: true,
  trackID: true,
  year: true,
};

async function getLibraryAsJson(path) {
  const library = await iTunesLibrary.getLibraryAsJson(path);
  return library;
}

function getPlaylists(library) {
  let playlists = library.playlists;
  return playlists.map((playlist) => {
    return cleanObjKeys(playlist);
  });
}

function getPlaylistData(playlistObj, allTracks) {
  const items = playlistObj.playlistItems || [];

  // return Array of playlist track data
  return items.map((value) => {
    return getTrackData(value, allTracks);
  });
}

function getTrackData(trackObj, allTracks) {
  let track = allTracks[trackObj["Track ID"]];

  if (track) {
    track = cleanTrackData(track);
    console.log(`${track.name} by ${track.artist}`);
    console.log(track);
  }
  return track;
}

function cleanObjKeys(obj) {
  const cleanedObj = {};
  for (let key in obj) {
    let cleanedKey = cleanKey(key);
    cleanedObj[cleanedKey] = obj[key];
  }

  return cleanedObj;
}

function cleanTrackData(track) {
  const cleanedTrack = {};
  for (let key in track) {
    let cleanedKey = cleanKey(key);
    if (cleanedKey in trackProps) {
      cleanedTrack[cleanedKey] = track[key];
    }
  }

  return cleanedTrack;
}

function cleanKey(key) {
  // todo look at how this function really works - replace, regex etc
  return key
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
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
  let libraryObj = await getLibraryAsJson("./data/iTunesLibrary.xml");
  libraryObj = cleanObjKeys(libraryObj);
  const playlists = getPlaylists(libraryObj);

  playlists.forEach((playlistObj) => {
    // todo: use playlistTracks

    // console.log(`getting playlistdata for ${playlistObj.name}`);

    if (playlistObj.name == "Popol Vuh Essentials") {
      console.log(`getting playlistdata for ${playlistObj.name}`);
      const playlistTracks = getPlaylistData(playlistObj, libraryObj.tracks);
      console.log(playlistTracks);
    }
  });

  console.log(`there are ${playlists.length} playlists`);
}

run();
