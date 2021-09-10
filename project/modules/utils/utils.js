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
    return blockedPlaylist.toLowerCase() == playlist.Name.toLowerCase();
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

exports.cleanObjKeys = (obj) => {
  const cleanedObj = {};
  for (let key in obj) {
    let cleanedKey = camelCaseKey(key);
    cleanedObj[cleanedKey] = obj[key];
  }

  return cleanedObj;
};

exports.getPlaylistData = (playlistObj, allTracks) => {
  const items = playlistObj.playlistItems || [];
  // return Array of playlist track data
  return items.map((value) => {
    return getTrackData(value, allTracks);
  });
};

const getTrackData = (trackObj, allTracks) => {
  try {
    let track = allTracks[trackObj["Track ID"]];
    if (!track) throw "no track found in tracklist";
    return cleanTrackData(track);
  } catch (err) {
    console.warn(err);
  }

  return {};
};

const cleanTrackData = (track) => {
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
