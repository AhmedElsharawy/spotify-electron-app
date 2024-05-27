require("dotenv").config();

const express = require("express");
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

// Replace these values with your Spotify app credentials
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/callback";

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

app.use(cors());

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

// Step 1: Authorize user
app.get("/login", (req, res) => {
  const scopes = ["user-read-recently-played"];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Step 2: Handle the callback after authorization
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body["access_token"];
    const refreshToken = data.body["refresh_token"];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    res.redirect("/recently-played");
  } catch (err) {
    console.error("Error getting tokens:", err);
    res.send("Error getting tokens.");
  }
});

// Step 3: Get the user's recently played tracks and update the history file
app.get("/recently-played", async (req, res) => {
  try {
    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 });
    const newTracks = data.body.items.map((item) => ({
      trackName: item.track.name,
      artistName: item.track.artists.map((artist) => artist.name).join(", "),
      playedAt: item.played_at,
    }));

    // Read current history
    const currentHistory = readHistoryFromFile();

    // Merge current history with new tracks
    const updatedHistory = mergeHistory(currentHistory, newTracks);

    // Save updated history to file
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
