import bot from "../bot.js";

export const sentToMessageTON = async ({ chatId, message }) => {
  if (!chatId || !message) {
    return res.status(400).json({ error: "chatId y message son requeridos" });
  }

  return await bot.telegram
    .sendMessage(chatId, message)
    .then(() => {
      return true;
    })
    .catch((error) => {
      return false;
    });
};
