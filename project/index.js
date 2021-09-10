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
  let track = allTracks[trackObj["Track ID"]];

  if (track) {
    console.log(`${track["Name"]} by ${track["Artist"]}`);
    track = cleanTrackData(track);
    console.log(track);
  }
  return track;
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
  const libraryObj = await getLibraryAsJson("./data/iTunesLibrary.xml");
  const playlists = getPlaylists(libraryObj);

  playlists.forEach((playlistObj) => {
    // todo: use playlistTracks

    // console.log(`getting playlistdata for ${playlistObj.Name}`);

    if (playlistObj.Name == "Popol Vuh Essentials") {
      console.log(`getting playlistdata for ${playlistObj.Name}`);
      const playlistTracks = getPlaylistData(playlistObj, libraryObj.Tracks);
      console.log(playlistTracks);
    }
  });

  console.log(`there are ${playlists.length} playlists`);
}

run();
