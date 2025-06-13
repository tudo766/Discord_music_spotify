const axios = require("axios");
require("dotenv").config();

let accessToken = null;
let expiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < expiresAt) return accessToken;

  const res = await axios.post("https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  accessToken = res.data.access_token;
  expiresAt = Date.now() + res.data.expires_in * 1000;
  return accessToken;
}

async function searchTrack(query) {
  const token = await getAccessToken();
  const res = await axios.get(`https://api.spotify.com/v1/search`, {
    params: { q: query, type: "track", limit: 1 },
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.tracks.items[0];
}

module.exports = { searchTrack };
