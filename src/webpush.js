import webpush from "web-push";
import { privateKey, publicKey } from "./const/index.js";

//mailto:test@faztweb.com
//mailto:desarrolloweb.progreso@gmail.com
webpush.setVapidDetails(
  "mailto:desarrolloweb.progreso@gmail.com",
  publicKey,
  privateKey
);

export default webpush;
