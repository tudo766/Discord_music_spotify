const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "stop",
  description: "Dừng nhạc và rời kênh voice",
  async execute(message) {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("Bot không đang phát nhạc.");

    const player = connection.state.subscription.player;
    player.stop();
    connection.destroy();

    message.reply("Nhạc đã dừng. Bot rời kênh.");
  }
};
