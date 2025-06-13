const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "leave",
  description: "Bot rời khỏi kênh voice",
  async execute(message) {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("Bot không đang ở kênh voice.");

    connection.destroy();
    message.reply("Bot đã rời kênh voice.");
  }
};
