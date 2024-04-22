import config from "../config/config.js";

const { CLAVE } = config;

export const validarClave = (req, res, next) => {
  const clave = req.header("clave");

  if (clave && clave === CLAVE) {
    next();
  } else {
    res.status(401).send("Clave no válida");
  }
};
