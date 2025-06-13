const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath("C:/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe");

const ytdl = require("@distube/ytdl-core"); 
const { searchTrack } = require("../spotify");
const { findYoutubeUrl } = require("../utils/ytSearch");

module.exports = {
  name: "play",
  description: "Phát nhạc từ Spotify qua YouTube",
  async execute(message, args) {
    if (!args.length) {
      return message.reply("Vui lòng nhập tên bài hát cần phát.");
    }

    if (!message.member.voice.channel) {
      return message.reply("Bạn cần vào một kênh voice trước.");
    }

    const query = args.join(" ");
    const track = await searchTrack(query);
    if (!track) return message.reply("Không tìm thấy bài hát trên Spotify.");

    const searchTerm = `${track.name} ${track.artists.map(a => a.name).join(" ")}`;
    const ytUrl = await findYoutubeUrl(searchTerm);
    if (!ytUrl) return message.reply("Không tìm thấy video YouTube phù hợp.");

    let stream;
    try {
      stream = await ytdl(ytUrl, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
      });
    } catch (err) {
      console.error("Lỗi tạo stream YouTube:", err);
      return message.reply("Lỗi khi tạo luồng âm thanh.");
    }

    const resource = createAudioResource(stream);
    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    return message.reply(`Đang phát: **${track.name}** – *${track.artists.map(a => a.name).join(", ")}*`);
  }
};
