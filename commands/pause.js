const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "pause",
  description: "Tạm dừng phát nhạc",
  async execute(message) {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("Bot không trong kênh voice.");

    const player = connection.state.subscription.player;
    player.pause();
    message.reply("Nhạc đã được tạm dừng.");
  }
};
