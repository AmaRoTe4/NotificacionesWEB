import fs from "fs-extra";

export function readFileJSON(nombreArchivo, callback) {
  fs.readFile(nombreArchivo, "utf8", (error, data) => {
    if (error) {
      callback(error, null);
      return;
    }

    try {
      const contenido = JSON.parse(data);
      callback(null, contenido);
    } catch (parseError) {
      callback(parseError, null);
    }
  });
}
