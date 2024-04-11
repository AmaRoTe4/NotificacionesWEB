import express from "express";
import morgan from "morgan";
import path from "path";
import router from "./src/routes/index.js";
import dirname from "./dirname.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
app.use(express.static(path.join(dirname, "public")));

app.listen(3000, () => {
  console.log("Server to listening on port 3000...");
});
