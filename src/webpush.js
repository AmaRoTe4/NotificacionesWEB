import webpush from "web-push";
import { privateKey, publicKey } from "./const/index.js";

webpush.setVapidDetails("mailto:test@faztweb.com", publicKey, privateKey);

export default webpush;
