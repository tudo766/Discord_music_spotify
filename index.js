const { Client, GatewayIntentBits, Collection } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
  generateDependencyReport
} = require("@discordjs/voice");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.log(generateDependencyReport());

require("http").createServer((req, res) => res.end("Bot is alive")).listen(process.env.PORT || 3000);


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

// ====== Các lệnh tích hợp trực tiếp ======
client.commands.set("play", {
  name: "play",
  description: "Phát nhạc từ Spotify + YouTube",
  async execute(message, args) {
    if (!args.length) return message.reply("Nhập tên bài hát.");
    if (!message.member.voice.channel) return message.reply("Vào kênh voice trước.");

    const query = args.join(" ");
    const { searchTrack } = require("./spotify");
    const { findYoutubeUrl } = require("./utils/ytSearch");
    const ytdl = require("@distube/ytdl-core");
    const track = await searchTrack(query);
    if (!track) return message.reply("Không tìm thấy bài hát trên Spotify.");

    const ytUrl = await findYoutubeUrl(`${track.name} ${track.artists.map(a => a.name).join(" ")}`);
    if (!ytUrl) return message.reply("Không tìm thấy video YouTube.");

    let stream;
    try {
      stream = await ytdl(ytUrl, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25
      });
    } catch (err) {
      console.error("Lỗi stream:", err);
      return message.reply("Lỗi khi tạo stream.");
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

    player.on(AudioPlayerStatus.Idle, () => connection.destroy());

    message.reply(`Đang phát: **${track.name}** – *${track.artists.map(a => a.name).join(", ")}*`);
  }
});

client.commands.set("pause", {
  name: "pause",
  description: "Tạm dừng nhạc",
  async execute(message) {
    const conn = getVoiceConnection(message.guild.id);
    if (!conn) return message.reply("Bot chưa vào voice.");
    const player = conn.state.subscription.player;
    player.pause();
    message.reply("Đã tạm dừng.");
  }
});

client.commands.set("resume", {
  name: "resume",
  description: "Tiếp tục nhạc",
  async execute(message) {
    const conn = getVoiceConnection(message.guild.id);
    if (!conn) return message.reply("Bot chưa vào voice.");
    const player = conn.state.subscription.player;
    player.unpause();
    message.reply("Đã tiếp tục.");
  }
});

client.commands.set("stop", {
  name: "stop",
  description: "Dừng và rời voice",
  async execute(message) {
    const conn = getVoiceConnection(message.guild.id);
    if (!conn) return message.reply("Bot chưa vào voice.");
    const player = conn.state.subscription.player;
    player.stop();
    conn.destroy();
    message.reply("Đã dừng và rời kênh.");
  }
});

client.commands.set("leave", {
  name: "leave",
  description: "Rời khỏi kênh voice",
  async execute(message) {
    const conn = getVoiceConnection(message.guild.id);
    if (!conn) return message.reply("Bot chưa trong kênh.");
    conn.destroy();
    message.reply("Đã rời kênh voice.");
  }
});

// ====== Xử lý tin nhắn ======
client.on("messageCreate", async message => {
  if (!message.content.startsWith("!") || message.author.bot) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (command) {
    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply(`Lỗi: ${error.message || "Không xác định."}`);
    }
  }
});

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
