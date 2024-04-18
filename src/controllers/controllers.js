import {
  generarConsultaCreate,
  generarConsultaUpdate,
  generarConsultaCreateMany,
  ajustarFechaYHora,
  normalizeIDSNoticationANDClients,
} from "../functions/index.js";
import db from "../db/db.js";
import webpush from "../webpush.js";
import vna from "../const/vna.js";
import newUUID from "../functions/newUUID.js";
import {
  date_notification_sent_cron,
  selectAllNotificacionesByIds,
  selectAllClientsByIds,
  marcar_sent_to_date_not_by_id,
  get_all_notifications_by_data_and_time_no_view,
  get_all_notifications_by_data_and_time,
  low_logic_client_by_id_user,
} from "../const/querys.js";

export const createQueryNotification = () => (req, res, next) => {
  //notificacion
  const { message, title } = req.body;
  //[time ,date, id_client]
  const { date_notifications } = req.body;

  const id_notificacion = newUUID();
  const notifications = {
    id: id_notificacion,
    message,
    title,
  };

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
    db.query(q_insert_not.query, q_insert_not.values, (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error mysql",
          status: false,
        });
      }

      const q_insert_date_not = generarConsultaCreateMany(
        vna.tables.date_notifications,
        many_date_notifications
      );

      db.query(
        q_insert_date_not.query,
        q_insert_date_not.values,
        (error, results) => {
          if (error) {
            console.log(error);
            return res.json({
              message: "Error mysql",
              status: false,
            });
          }

          return res.json({
            message: "Notification create with corretamente",
            status: true,
          });
        }
      );
    });
  } catch (err) {
    res.json({ message: err.message, status: false });
    next(err);
  }
};

export const createQueryClient = () => (req, res, next) => {
  const subscription = req.body?.subscription;
  const id_user = req.body?.id_user;
  const type = req.body?.type;

  const data = {
    id_user,
    id: newUUID(),
    subscription: JSON.stringify(subscription),
    state: 1,
    type,
  };

  const query_select = `SELECT * FROM ${vna.tables.clients} WHERE id_user="${data.id_user}";`;
  const query_update = `UPDATE ${vna.tables.clients} SET subscription = ?, type = ?, state="1" WHERE ${data.id_user}`;

  try {
    db.query(query_select, (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error mysql",
          status: false,
        });
      }

      if (results.length === 0) {
        const create = generarConsultaCreate(vna.tables.clients, data);

        const query_create = create.query;
        const values_create = create.values;

        db.query(query_create, values_create, (error, results) => {
          if (error) {
            return res.json({
              message: "Error mysql",
              status: false,
            });
          }

          return res.json({
            message: "Create client succefull",
            status: true,
          });
        });
      } else {
        db.query(
          query_update,
          [data.subscription, data?.type],
          (error, results) => {
            if (error) {
              return res.json({
                message: "Error mysql",
                status: false,
              });
            }

            return res.json({
              message: "Update client succefull",
              status: true,
            });
          }
        );
      }
    });
  } catch (err) {
    console.log("ERROR EN LA CATCH");
    console.log({ message: err.message, status: false });
    res.json({ message: err.message, status: false });
    next(err);
  }
};

export const sentNotificationNow = () => (req, res, next) => {
  const message = req?.body?.message;
  const title = req?.body?.title;
  const id_users = req?.body?.id_users;

  if (
    message == null ||
    title == null ||
    id_users == null ||
    message.length === 0 ||
    title.length === 0 ||
    id_users.length === 0
  ) {
    res.status(500).json({
      status: false,
      message: "body no valido",
    });
    return;
  }

  try {
    db.query(`SELECT * FROM ${vna.tables.clients};`, (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error mysql",
          status: false,
        });
      }

      const payload = JSON.stringify({
        title,
        message,
      });

      for (let i = 0; id_users.length > i; i++) {
        const pushSubscripton = results?.find((n) => {
          return n?.id.toString() === id_users[i]?.toString();
        })?.subscription;

        if (pushSubscripton) {
          console.log("Notificacion enviada");
          webpush.sendNotification(JSON.parse(pushSubscripton), payload);
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
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: false });
    next(err);
  }
};

export const sentNotificationCron = () => {
  const { date, time } = ajustarFechaYHora();
  const first_query = date_notification_sent_cron({ date, time });

  return;

  try {
    db.query(first_query, (error, results_notificaciones_sent) => {
      if (error) return console.log(error);
      if (results_notificaciones_sent.length === 0) {
        console.log("no hay notificaciones que mandar");
        console.log(results_notificaciones_sent);
        return;
      }

      const { ids_clients, ids_notifications } =
        normalizeIDSNoticationANDClients({
          array: results_notificaciones_sent,
        });

      const queryNot = selectAllNotificacionesByIds({
        ids: ids_notifications,
      });
      const queryCli = selectAllClientsByIds({ ids: ids_clients });

      db.query(queryNot, (error, results_not) => {
        if (error) return console.log(error);
        if (results_not.length === 0) return console.log("no query client not");

        db.query(queryCli, async (error, results_cli) => {
          if (error) return console.log(error);
          if (results_cli.length === 0)
            return console.log("no query client cli");

          for (let i = 0; results_notificaciones_sent.length > i; i++) {
            const aux = results_notificaciones_sent[i];

            const { message, title } = results_not.find(
              (n) => n.id.toString() === aux.id_notificacion.toString()
            );

            const pushSubscripton = results_cli?.find(
              (n) => n?.id.toString() === aux.id_client.toString()
            )?.subscription;

            const payload = JSON.stringify({
              title,
              message,
            });

            if (pushSubscripton) {
              console.log(pushSubscripton);

              const resultado = await webpush?.sendNotification(
                JSON.parse(pushSubscripton),
                payload
              );

              console.log("resultado");
              console.log(resultado);

              if (resultado.statusCode !== 201) {
                console.log(
                  "Error al enviar la notificacion: " +
                    JSON.stringify(resultado)
                );
              } else {
                db.query(
                  marcar_sent_to_date_not_by_id({ id: aux.id }),
                  (error) => {
                    if (error) return console.log(error);
                  }
                );
                console.log("Notificacion enviada!");
              }
            } else {
              console.log("pash subscripton no encotrado");
            }
          }
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
};

export const getAllNotificationsByDataAndTime = (req, res, next) => {
  try {
    db.query(get_all_notifications_by_data_and_time, (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error mysql",
          status: false,
        });
      }

      res.json(results);
    });
  } catch (err) {
    res.json({ message: err.message, status: false });
    next(err);
  }
};

export const getAllNotificationsByDataAndTimeNoView = (req, res, next) => {
  try {
    db.query(
      get_all_notifications_by_data_and_time_no_view,
      (error, results) => {
        if (error) {
          console.log(error);
          return res.json({
            message: "Error mysql",
            status: false,
          });
        }

        res.json(results);
      }
    );
  } catch (err) {
    res.json({ message: err.message, status: false });
    next(err);
  }
};

export const lowLogicClientByIdUser = (req, res, next) => {
  const id_user = req.params.id_user;

  try {
    db.query(low_logic_client_by_id_user({ id_user }), (error, results) => {
      if (error) {
        console.log(error);
        return res.json({
          message: "Error mysql",
          status: false,
        });
      }

      res.json({
        status: true,
        message: "Cliente low logic true",
      });
    });
  } catch (err) {
    res.json({ message: err.message, status: false });
    next(err);
  }
};

//another
//--------------------------

export const getAllDataWithState = (table_name) => (req, res, next) => {
  try {
    db.query(`SELECT * FROM ${table_name} WHERE state=1`, (error, results) => {
      if (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Error in select query" });
      } else {
        res.json(results);
      }
    });
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

//export const getAllData = (table_name) => (req, res, next) => {
//  try {
//    db.query(`SELECT * FROM ${table_name}`, (error, results) => {
//      if (error) {
//        console.error("Error: ", error);
//        res.status(500).json({ error: "Error in select query" });
//      } else {
//        res.json(results);
//      }
//    });
//  } catch (err) {
//    res.json({ message: err.message });
//    next(err);
//  }
//};

//export const getDataById = (table_name) => (req, res, next) => {
//  const id_user = req.params.id;

//  try {
//    db.query(
//      `SELECT * FROM ${table_name} WHERE id='${id_user}'`,
//      (error, results) => {
//        if (error) {
//          console.error("Error: ", error);
//          res.status(500).json({ error: "Error in select query" });
//        } else {
//          res.json(results);
//        }
//      }
//    );
//  } catch (err) {
//    res.json({ message: err.message });
//    next(err);
//  }
//};

//export const getAllDataByIdUserState =
//  (table_name, limit = 0) =>
//  (req, res, next) => {
//    const { id_user } = req.params;

//    try {
//      db.query(
//        `SELECT * FROM ${table_name} WHERE id_user='${id_user}' AND state='1' ${
//          limit === 0 ? "" : "ORDER BY created_at DESC LIMIT " + limit
//        };`,
//        (error, results) => {
//          if (error) {
//            console.error("Error: ", error);
//            res.status(500).json({ error: "Error in select query" });
//          } else {
//            res.json(results);
//          }
//        }
//      );
//    } catch (err) {
//      res.json({ message: err.message });
//      next(err);
//    }
//  };

export const updateData = (table_name) => (req, res, next) => {
  const { query, values } = generarConsultaUpdate(
    table_name,
    req.body,
    `id='${req.body.id}'`
  );

  try {
    db.query(query, values, (error, results) => {
      if (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Error in update query", status: false });
      } else {
        res.json({
          status: true,
          results,
          message: "actualizado con exitos",
        });
      }
    });
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

//export const createData = (table_name) => (req, res, next) => {
//  const { query, values } = generarConsultaCreate(table_name, req.body);

//  try {
//    db.query(query, values, (error, results, ...otro) => {
//      if (error) {
//        console.error("Error: ", error);
//        if (
//          error.sqlState === "23000" &&
//          table_name === VNA.tables_app.inscriptos
//        ) {
//          res.json({
//            status: true,
//            results,
//            message: VNA.backend.reinicio,
//          });
//        } else
//          res
//            .status(500)
//            .json({ error: "Error in create query", status: false });
//      } else {
//        res.json({
//          status: true,
//          results,
//          message: "Creado con exitos",
//        });
//      }
//    });
//  } catch (err) {
//    res.json({ message: err.message });
//    next(err);
//  }
//};

//export const createDataMany = (table_name) => (req, res, next) => {
//  const { query, values } = generarConsultaCreateMany(table_name, req.body);

//  try {
//    db.query(query, values, (error, results) => {
//      if (error) {
//        console.error("Error: ", error);
//        if (error.sqlState === "23000")
//          res.json({
//            status: true,
//            results,
//            message: VNA.backend.reinicio,
//          });
//        else
//          res
//            .status(500)
//            .json({ error: "Error in create query", status: false });
//      } else {
//        res.json({
//          status: true,
//          results,
//          message: "Creado con exitos",
//        });
//      }
//    });
//  } catch (err) {
//    res.json({ message: err.message });
//    next(err);
//  }
//};

export const lowLogic = (table_name) => (req, res, next) => {
  try {
    db.query(
      `UPDATE ${table_name} SET state='0' WHERE id='${req.body.id}'`,
      (error, results) => {
        if (error) {
          console.error("Error: ", error);
          res
            .status(500)
            .json({ error: "Error in update query", status: false });
        } else {
          res.json({
            status: true,
            results,
            message: "actualizado con exitos",
          });
        }
      }
    );
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

//export const deleteData = (table_name) => (req, res, next) => {
//  try {
//    db.query(
//      `DELETE FROM ${table_name} WHERE id='${req.body.id}'`,
//      (error, results) => {
//        if (error) {
//          console.error("Error: ", error);
//          res
//            .status(500)
//            .json({ error: "Error in delete query", status: false });
//        } else {
//          res.json({
//            status: true,
//            results,
//            message: "delete with successful",
//          });
//        }
//      }
//    );
//  } catch (err) {
//    res.json({ message: err.message });
//    next(err);
//  }
//};

//export const deleteDataToDobleId = (table_name) => (req, res, next) => {
//  const name_id_first = req.body.name_id_first;
//  const name_id_second = req.body.name_id_second;
//  const id_first = req.body.id_first;
//  const id_second = req.body.id_second;

//  const condition = `${name_id_first}='${id_first}' AND ${name_id_second}='${id_second}'`;

//  try {
//    db.query(
//      `DELETE FROM ${table_name} WHERE ${condition}`,
//      (error, results) => {
//        if (error) {
//          console.error("Error: ", error);
//          res
//            .status(500)
//            .json({ error: "Error in delete query", status: false });
//        } else {
//          res.json({
//            status: true,
//            results,
//            message: "delete with successful",
//          });
//        }
//      }
//    );
//  } catch (err) {
//    console.log(err.message);
//    res.json({ message: "Error al borrar" });
//    next(err);
//  }
//};
