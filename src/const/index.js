import dotenv from "dotenv";

dotenv.config();

export const publicKey = process.env.PUBLIC_KEY ?? "";
export const privateKey = process.env.PRIVATE_KEY ?? "";
