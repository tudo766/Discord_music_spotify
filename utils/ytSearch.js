const yts = require("yt-search");

async function findYoutubeUrl(query) {
  const res = await yts(query);
  const video = res.videos.length > 0 ? res.videos[0] : null;
  return video?.url;
}

module.exports = { findYoutubeUrl };
