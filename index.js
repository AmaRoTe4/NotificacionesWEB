import express from "express";
import morgan from "morgan";
import path from "path";
import router from "./src/routes/index.js";
import dirname from "./dirname.js";
import cors from "cors";
import dotenv from "dotenv";
import cron from "./src/cron.js";
import { sentNotificationCron } from "./src/controllers/controllers.js";
import config from "./src/config/config.js";
import vna from "./src/const/vna.js";

const { PORT } = config;

dotenv.config();
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
app.use(express.static(path.join(dirname, "public")));

cron({
  funcion: sentNotificationCron,
  timer: vna.defaultTimer,
});

app.listen(PORT, () => {
  console.log(`Server to listening on port ${PORT}...`);
});
