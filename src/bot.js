import { Telegraf } from "telegraf";
import config from "./config/config.js";
import { createQueryClient } from "./controllers/controllers.js";
import vna from "./const/vna.js";

const { TOKEN_CHAT_TELEGRAM } = config;
const bot = new Telegraf(TOKEN_CHAT_TELEGRAM);

bot.use((ctx, next) => {
  console.log(ctx);

  return next();
});

bot.command("suscribir", async (ctx) => {
  const [clave, id] = ctx.message.text.split(" ").slice(1); // Extrae la clave y el ID del mensaje
  if (!clave || !id) {
    ctx.reply("Formato incorrecto. Uso: /suscribir clave id");
    return;
  }

  const chatId = ctx.message.chat.id;

  const res = await createQueryClient({
    id_chat: chatId,
    id_user: id,
    type: vna.type_dispositivo.another,
  });

  if (res) ctx.reply(`Suscripto con exito!`);
  else ctx.reply(`No se puedo suscribir, consulte a mentenimiento!`);
});

export default bot;
