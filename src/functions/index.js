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

export function ajustarFechaYHora() {
  let now = new Date();
  let minutos = now.getMinutes();

  if (minutos >= 53 || 7 >= minutos) {
    now.setMinutes(0);
    if (59 <= minutos) now.setHours(now.getHours() + 1);
  } else if (minutos >= 8 && 22 >= minutos) {
    now.setMinutes(15);
  } else if (minutos >= 23 && 37 >= minutos) {
    now.setMinutes(30);
  } else if (minutos >= 38 && 52 >= minutos) {
    now.setMinutes(45);
  }

  now.setSeconds(0);
  now.setMilliseconds(0);

  let hora = ("0" + now.getHours()).slice(-2);
  minutos = ("0" + now.getMinutes()).slice(-2);

  let fecha =
    now.getFullYear() +
    "-" +
    ("0" + (now.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + now.getDate()).slice(-2);

  let fechaHoraAjustada = { time: hora + ":" + minutos + ":00", date: fecha };
  return fechaHoraAjustada;
}

export function normalizeIDSNoticationANDClients({ array }) {
  const aux_results_notificaciones_sent = [...array];

  let ids_clients = [];
  let ids_notifications = [];

  aux_results_notificaciones_sent.map((n) => {
    const id_notificacion = n.id_notificacion;
    const id_user = n.id_user;

    if (!ids_clients.includes(id_user)) ids_clients.push(id_user);
    if (!ids_notifications.includes(id_notificacion))
      ids_notifications.push(id_notificacion);
  });

  return {
    ids_clients,
    ids_notifications,
  };
}
