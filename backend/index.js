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

// Authorize user
app.get("/", (req, res) => {
  const scopes = [
    "user-read-recently-played",
    "streaming",
    "user-modify-playback-state",
    "user-read-playback-state",
    "app-remote-control",
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

    res.redirect(`http://localhost:3001`);
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

// Get the user's recently played tracks and update the history file
app.get("/recently-played", async (req, res) => {
  try {
    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 });
    const newTracks = data.body.items.map((item) => ({
      trackName: item.track.name,
      artistName: item.track.artists.map((artist) => artist.name).join(", "),
      playedAt: item.played_at,
      albumArt: item.track.album.images[0]?.url,
    }));

    const currentHistory = readHistoryFromFile();
    const updatedHistory = mergeHistory(currentHistory, newTracks);
    writeHistoryToFile(updatedHistory);

    res.json(newTracks);
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
