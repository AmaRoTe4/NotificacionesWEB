import dotenv from "dotenv";
import vna from "../const/vna.js";

dotenv.config();

export default process.env.STATUS === vna.status_app.dev
  ? {
      HOST: "localhost",
      PORT: 3500,
      DB_USER: "root",
      DB_PASSWORD: "",
      DB_HOST: "localhost",
      DB_NAME: "notificaciones_webs",
      DB_PORT: 3306,
      TOKEN_CHAT_TELEGRAM: process.env.TOKEN_CHAT_TELEGRAM,
      WEBHOOKDOMAIN: "",
      WHPORT: "",
      CLAVE: process.env.CLAVE,
      STATUS: process.env.STATUS,
    }
  : {
      HOST: process.env.HOST || "localhost",
      PORT: process.env.PORT || 3500,
      DB_USER: process.env.DB_USER || "progreso",
      DB_PASSWORD: process.env.DB_PASSWORD || "PROGRESO_digital2024",
      DB_HOST: process.env.DB_HOST || "localhost",
      DB_NAME: process.env.DB_NAME || "notificaciones_webs",
      DB_PORT: process.env.DB_PORT || 3306,
      TOKEN_CHAT_TELEGRAM: process.env.TOKEN_CHAT_TELEGRAM,
      WEBHOOKDOMAIN: process.env.WEBHOOKDOMAIN,
      WHPORT: process.env.WHPORT,
      CLAVE: process.env.CLAVE,
      STATUS: process.env.STATUS,
    };
