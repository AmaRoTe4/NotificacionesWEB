import dotenv from "dotenv";

dotenv.config();

export const HOST = process.env.HOST || "localhost";
export const PORT = process.env.PORT || 3000;
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_NAME = process.env.DB_NAME || "notificaciones_webs";
export const DB_PORT = process.env.DB_PORT || 3306;
export const CLAVE_BACKEND = process.env.CLAVE_BACKEND || "3iMqMXA6mCT7Rz9";
