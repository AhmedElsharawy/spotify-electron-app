require("dotenv").config();

const express = require("express");
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/callback";

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

app.use(cors());

let accessToken = "";
let refreshToken = "";

// Helper function to read history from file
const readHistoryFromFile = () => {
  const filePath = path.join(__dirname, "listening_history.json");
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  }
  return [];
};

// Helper function to write history to file
const writeHistoryToFile = (history) => {
  const filePath = path.join(__dirname, "listening_history.json");
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
};

// Helper function to merge new tracks with existing history
const mergeHistory = (currentHistory, newTracks) => {
  const trackMap = new Map();
  currentHistory.forEach((track) => trackMap.set(track.playedAt, track));
  newTracks.forEach((track) => trackMap.set(track.playedAt, track));
  return Array.from(trackMap.values()).sort(
    (a, b) => new Date(a.playedAt) - new Date(b.playedAt),
  );
};

// Helper function to extract top genres from listening history
const extractTopGenres = (history) => {
  const genreCounts = {};
  history.forEach(track => {
    track.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
  return sortedGenres.slice(0, 5); // Get top 5 genres
};

// Helper function to get recommendations based on genres
const getRecommendations = async (genres) => {
  const genreString = genres.join(',');
  const response = await axios.get('https://api.spotify.com/v1/recommendations', {
    headers: {
      'Authorization': 'Bearer ' + spotifyApi.getAccessToken()
    },
    params: {
      seed_genres: genreString,
      limit: 10
    }
  });
  return response.data.tracks;
};

// Authorize user
app.get("/", (req, res) => {
  const scopes = [
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Handle the callback after authorization
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    accessToken = data.body["access_token"];
    refreshToken = data.body["refresh_token"];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    res.redirect(`http://localhost:5173`);
  } catch (err) {
    console.error("Error getting tokens:", err);
    res.send("Error getting tokens.");
  }
});

// Refresh access token when needed
const refreshAccessToken = async () => {
  try {
    const data = await spotifyApi.refreshAccessToken();
    accessToken = data.body["access_token"];
    spotifyApi.setAccessToken(accessToken);
  } catch (error) {
    console.error("Could not refresh access token", error);
  }
};

// Helper function to fetch artist genres
const fetchArtistGenres = async (artistIds) => {
  const artistData = await spotifyApi.getArtists(artistIds);
  const artistGenres = {};
  artistData.body.artists.forEach((artist) => {
    artistGenres[artist.id] = artist.genres;
  });
  return artistGenres;
};

// Get the user's recently played tracks and update the history file
app.get("/recently-played", async (req, res) => {
  try {
    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 30 });
    const newTracks = data.body.items.map((item) => ({
      trackName: item.track.name,
      artistNames: item.track.artists.map((artist) => ({
        name: artist.name,
        id: artist.id,
      })),
      playedAt: item.played_at,
      albumArt: item.track.album.images[0]?.url,
    }));

    // Fetch genres for all artists
    const artistIds = newTracks.flatMap((track) =>
      track.artistNames.map((artist) => artist.id)
    );
    const artistGenres = await fetchArtistGenres(artistIds);

    // Add genres to new tracks
    const tracksWithGenres = newTracks.map((track) => ({
      ...track,
      genres: track.artistNames.flatMap(
        (artist) => artistGenres[artist.id] || []
      ),
    }));

    const currentHistory = readHistoryFromFile();
    const updatedHistory = mergeHistory(currentHistory, tracksWithGenres);
    writeHistoryToFile(updatedHistory);

    res.json(tracksWithGenres);
  } catch (err) {
    console.error("Error getting recently played tracks:", err);
    res.send("Error getting recently played tracks.");
  }
});

// Endpoint to view the recorded history
app.get("/history", (req, res) => {
  const history = readHistoryFromFile();
  res.json(history);
});

// Endpoint to get song recommendations based on listening history
app.get("/recommendations", async (req, res) => {
  try {
    const history = readHistoryFromFile();
    const topGenres = extractTopGenres(history);
    const recommendations = await getRecommendations(topGenres);

    const formattedRecommendations = recommendations.map(track => ({
      trackName: track.name,
      artistNames: track.artists.map(artist => artist.name).join(', '),
      albumArt: track.album.images[0]?.url,
    }));

    res.json(formattedRecommendations);
  } catch (err) {
    console.error("Error getting recommendations:", err);
    res.send("Error getting recommendations.");
  }
});

// Endpoint to provide access token to frontend
app.get("/token", async (req, res) => {
  try {
    const accessToken = spotifyApi.getAccessToken();
    if (accessToken) {
      res.json({ access_token: accessToken });
    } else {
      res.status(401).send("Access token not available");
    }
  } catch (err) {
    console.error("Error getting access token:", err);
    res.status(500).send("Error getting access token");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
