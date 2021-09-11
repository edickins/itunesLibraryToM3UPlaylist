const fs = require("fs");
const path = require("path");
var { MongoClient } = require("mongodb");
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

/* load iTunes library and convert into a JSON object */
async function getLibraryAsJson() {
  // path relative to location of getLibraryAsJson function deinition.
  const path = "../../data/iTunesLibrary.xml";
  const library = await iTunesLibrary.getLibraryAsJson(path);
  return library;
}

/* extract and clean up all playlists from library JSON object */
function getPlaylistsFromLibrary(library) {
  const playlists = removeBlockedPlaylists(library.playlists);
  return playlists.map((playlist) => {
    return cleanObjKeys(playlist);
  });
}

function removeBlockedPlaylists(playlists) {
  return playlists.reduce((previousValue, nextValue) => {
    if (!playlistIsBlocked(nextValue, BLOCKED_PLAYLISTS)) {
      previousValue.push(nextValue);
    }
    return previousValue;
  }, []);
}

/* replace all existing playlists in the playlists collection */
async function writePlaylistsToMongoDB(playlists) {
  const url = "mongodb://localhost:27017";

  const client = new MongoClient(url);

  try {
    await client.connect();
    await listDatabases(client);
    await addPlaylists(client, playlists);
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
}

async function addPlaylists(client, playlists) {
  // Drop the collection
  await client
    .db("iTunes")
    .collection("playlists")
    .drop(function (err, result) {
      if (err) throw err;
      if (result) console.log("Collection successfully deleted.");
    });

  const result = await client
    .db("iTunes")
    .collection("playlists")
    .insertMany(playlists);

  console.log(
    `${result.insertedCount} new playlists added with the following ids`
  );
  console.log(result.insertedIds);
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  databasesList.databases.forEach((db) => {
    console.log(` - ${db.name}`);
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
  });
  console.log(`there are ${playlistsForDatabase.length} playlists`);
  await writePlaylistsToMongoDB(playlistsForDatabase);
}

run();
