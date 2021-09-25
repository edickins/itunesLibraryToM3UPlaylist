const TRACK_PROPS = {
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

/* playlistIsBlocked */
exports.playlistIsBlocked = (playlist, BLOCKED_PLAYLISTS) => {
  return BLOCKED_PLAYLISTS.some((blockedPlaylist) => {
    return blockedPlaylist.toLowerCase() == playlist.name.toLowerCase();
  });
};

/* camelCase key prop name */
const camelCaseKey = (key) => {
  // todo look at how this function really works - replace, regex etc
  return key
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

/* clean up keys in Object */
exports.cleanObjKeys = (obj) => {
  const cleanedObj = {};
  for (let key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item) => {
        return this.cleanObjKeys(item);
      });
    }
    let cleanedKey = camelCaseKey(key);
    cleanedObj[cleanedKey] = obj[key];
  }

  return cleanedObj;
};

/* get data for each track in a playlist from master list of tracks*/
exports.getPlaylistData = (playlistObj, allTracks) => {
  const items = playlistObj.playlistItems || [];
  // return Array of playlist track data
  return items.map((value) => {
    return getTrackData(value, allTracks);
  });
};

const getTrackData = (trackObj, allTracks) => {
  try {
    let track = allTracks[trackObj["trackID"]];
    if (!track) throw "no track found in tracklist";
    return cleanUpTrackDataProps(track);
  } catch (err) {
    console.warn(err);
  }

  return {};
};

const cleanUpTrackDataProps = (track) => {
  const cleanedTrack = {};
  for (let key in track) {
    let cleanedKey = camelCaseKey(key);
    if (cleanedKey in TRACK_PROPS) {
      if (track[key]) {
        cleanedTrack[cleanedKey] = track[key];
      }
    }
  }

  return cleanedTrack;
};

exports.createCollectionDoc = (playlistObj, playlistItems) => {
  const docObj = {
    dateCreated: new Date(),
    lastUpdated: new Date(),
    playlistName: playlistObj.name,
    playlistItems: playlistItems,
  };

  return docObj;
};
