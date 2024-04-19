import {
  generarConsultaCreate,
  generarConsultaUpdate,
  generarConsultaCreateMany,
  ajustarFechaYHora,
  normalizeIDSNoticationANDClients,
} from "../functions/index.js";
import db from "../db/db.js";
import newUUID from "../functions/newUUID.js";
import {
  date_notification_sent_cron,
  selectAllNotificacionesByIds,
  selectAllClientsByIds,
  marcar_sent_to_date_not_by_id,
  get_all_next_notifications,
  get_all_notifications,
  low_logic_client_by_id_user,
} from "../const/querys.js";
import { sentToMessageTON } from "./controllers.bot.js";
import vna from "../const/vna.js";

export const createQueryNotification = () => async (req, res, next) => {
  //notificacion
  const { message } = req.body;
  const { date_notifications } = req.body;

  const id_notificacion = newUUID();
  const notifications = {
    id: id_notificacion,
    message,
  };

  if (message?.length === 0) {
    return res.json({
      message: "body no valido",
      status: false,
    });
  }

  const many_date_notifications = date_notifications.map((n) => {
    const id = newUUID();

    return {
      ...n,
      id_notificacion,
      id,
    };
  });

  const q_insert_not = generarConsultaCreate(
    vna.tables.notifications,
    notifications
  );

  try {
    const [] = await db.query(q_insert_not.query, q_insert_not.values);

    const q_insert_date_not = generarConsultaCreateMany(
      vna.tables.date_notifications,
      many_date_notifications
    );

    const [] = await db.query(
      q_insert_date_not.query,
      q_insert_date_not.values
    );

    return res.json({
      message: "Notification create with corretamente",
      status: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
    next(err);
  }
};

export const createQueryClient = async ({ id_chat, id_user, type }) => {
  const data = {
    id_user,
    id_chat,
    state: 1,
    type,
  };

  const query_select = `SELECT * FROM ${vna.tables.clients} WHERE id_user="${data.id_user}";`;
  const query_update = `UPDATE ${vna.tables.clients} SET id_chat = ?, type = ?, state="1" WHERE id_user='${data.id_user}'`;

  try {
    const [results] = await db.query(query_select);

    if (results.length === 0) {
      const create = generarConsultaCreate(vna.tables.clients, data);

      const query_create = create.query;
      const values_create = create.values;

      const [] = await db.query(query_create, values_create);
    } else {
      const [] = await db.query(query_update, [data.id_chat, data?.type]);
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const sentNotificationNow = () => async (req, res, next) => {
  const message = req?.body?.message;
  const id_users = req?.body?.id_users;

  if (
    message == null ||
    id_users == null ||
    message.length === 0 ||
    id_users.length === 0
  ) {
    res.status(500).json({
      status: false,
      message: "body no valido",
    });
    return;
  }

  try {
    const [results] = await db.query(`SELECT * FROM ${vna.tables.clients};`);

    for (let i = 0; id_users?.length > i; i++) {
      const id_chat_use = results?.find((n) => {
        return n?.id_user?.toString() === id_users[i]?.toString();
      })?.id_chat;

      if (id_chat_use) {
        console.log("Notificacion enviada");
        await sentToMessageTON({ chatId: id_chat_use, message });
        res.status(200).json({
          status: true,
          message: "Notificacion enviada",
        });
      } else {
        console.log("Notificacion no enviada");
        res.status(204).json({
          status: false,
          message: "Notificacion no enviada",
        });
      }
    }

    return results;
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
    next(err);
  }
};

export const sentNotificationCron = async () => {
  const { date, time } = ajustarFechaYHora();
  const first_query = date_notification_sent_cron({ date, time });

  try {
    const [results_notificaciones_sent] = await db.query(first_query);

    if (results_notificaciones_sent.length === 0) {
      return;
    }

    console.log(results_notificaciones_sent);

    const { ids_clients, ids_notifications } = normalizeIDSNoticationANDClients(
      {
        array: results_notificaciones_sent,
      }
    );

    const queryNot = selectAllNotificacionesByIds({
      ids: ids_notifications,
    });

    const queryCli = selectAllClientsByIds({ ids: ids_clients });

    const [results_not] = await db.query(queryNot);

    if (results_not.length === 0) return console.log("no query client not");

    const [results_cli] = await db.query(queryCli);

    if (results_cli.length === 0) return console.log("no query client cli");

    for (let i = 0; results_notificaciones_sent.length > i; i++) {
      const aux = results_notificaciones_sent[i];

      const { message } = results_not.find(
        (n) => n.id.toString() === aux.id_notificacion.toString()
      );

      const id_chat_use = results_cli?.find(
        (n) => n?.id_user.toString() === aux.id_user.toString()
      )?.id_chat;

      if (id_chat_use) {
        console.log(id_chat_use);

        const resultado = await sentToMessageTON({
          chatId: id_chat_use,
          message,
        });

        if (!resultado) {
          console.log(
            "Error al enviar la notificacion: " + JSON.stringify(resultado)
          );
        } else {
          const [] = await db.query(
            marcar_sent_to_date_not_by_id({ id: aux.id })
          );
          console.log("Notificacion enviada!");
        }
      } else {
        console.log("pash subscripton no encotrado");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAllNotifications = async (req, res, next) => {
  try {
    const [results] = await db.query(get_all_notifications);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
    next(err);
  }
};

export const getAllNextNotification = async (req, res, next) => {
  try {
    const [results] = await db.query(get_all_next_notifications);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
    next(err);
  }
};

export const lowLogicClientByIdUser = async (req, res, next) => {
  const id_user = req.body?.id_user;

  try {
    await db.query(low_logic_client_by_id_user({ id_user }));
    res.json({
      status: true,
      message: "Cliente low logic true",
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
    next(err);
  }
};

//another
//--------------------------

export const getAllDataWithState = (table_name) => async (req, res, next) => {
  try {
    const [results] = await db.query(
      `SELECT * FROM ${table_name} WHERE state=1`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
    next(err);
  }
};

export const updateData = (table_name) => async (req, res, next) => {
  if (req.body?.id) {
    return res.json({
      status: false,
      message: "body no validate",
    });
  }

  const { query, values } = generarConsultaUpdate(
    table_name,
    req.body,
    `id='${req.body?.id}'`
  );

  try {
    const [results] = await db.query(query, values);

    res.json({
      status: true,
      results,
      message: "actualizado con exitos",
    });
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

export const lowLogic = (table_name) => async (req, res, next) => {
  try {
    const [results] = await db.query(
      `UPDATE ${table_name} SET state='0' WHERE id='${req.body.id}'`
    );
    res.json({
      status: true,
      results,
      message: "actualizado con exitos",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    next(err);
  }
};
