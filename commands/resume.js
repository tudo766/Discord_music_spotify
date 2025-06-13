const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "resume",
  description: "Tiếp tục phát nhạc",
  async execute(message) {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("Bot không trong kênh voice.");

    const player = connection.state.subscription.player;
    player.unpause();
    message.reply("Nhạc đã được tiếp tục.");
  }
};
