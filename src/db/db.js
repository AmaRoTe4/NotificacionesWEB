import config from "../config/config.js";
import mysql from "mysql2";

const { DB_NAME, DB_PASSWORD, DB_HOST, DB_USER } = config;

const connection = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

connection.on("error", (err) => {
  console.error("Error de MySQL Pool:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    handleDisconnect();
  } else {
    throw err;
  }
});

function handleDisconnect() {
  console.log("Reconectando a MySQL...");
  connection.end();
  connection = mysql.createPool(dbConfig);
}

export default connection;
