export function generarConsultaUpdate(tabla, valores, condicion) {
  if (Object.keys(valores).length === 0) {
    throw new Error(
      "El objeto de valores está vacío. No hay datos para actualizar."
    );
  }

  const sets = Object.keys(valores)
    .map((campo) => `${campo} = ?`)
    .join(", ");

  const updateQuery = `UPDATE ${tabla} SET ${sets} WHERE ${condicion}`;
  const updateValues = Object.values(valores);

  return { query: updateQuery, values: updateValues };
}

export function generarConsultaCreate(tabla, valores) {
  if (Object.keys(valores).length === 0) {
    throw new Error(
      "El objeto de valores está vacío. No hay datos para crear un nuevo registro."
    );
  }

  const columnas = Object.keys(valores).join(", ");
  const marcadores = Object.values(valores)
    .map(() => "?")
    .join(", ");

  const insertQuery = `INSERT INTO ${tabla} (${columnas}) VALUES (${marcadores})`;
  const insertValues = Object.values(valores);

  return { query: insertQuery, values: insertValues };
}

export function generarConsultaCreateMany(tabla, registros) {
  if (!registros || registros.length === 0) {
    throw new Error(
      "El array de registros está vacío. No hay datos para crear nuevos registros."
    );
  }

  const columnas = Object.keys(registros[0]).join(", ");
  const marcadores = registros
    .map(
      () =>
        `(${Object.values(registros[0])
          .map(() => "?")
          .join(", ")})`
    )
    .join(", ");

  const insertQuery = `INSERT INTO ${tabla} (${columnas}) VALUES ${marcadores}`;
  const insertValues = registros.flatMap((registro) => Object.values(registro));

  return { query: insertQuery, values: insertValues };
}
