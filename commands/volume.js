module.exports = {
    name: "volume",
    description: "Điều chỉnh âm lượng",
    async execute(message, args) {
      const vol = parseFloat(args[0]);
      if (isNaN(vol) || vol < 0 || vol > 1) {
        return message.reply("Nhập giá trị từ 0.0 đến 1.0");
      }
      return message.reply("🔈 Đã ghi nhận yêu cầu (cần tích hợp với player)");
    }
  };
  