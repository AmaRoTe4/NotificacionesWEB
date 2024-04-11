import {
  generarConsultaCreate,
  generarConsultaUpdate,
  generarConsultaCreateMany,
} from "../functions/index.js";
import db from "../db/db.js";
import webpush from "../webpush.js";
import vna from "../const/vna.js";

export const createQueryClient =
  ({ data }) =>
  (req, res, next) => {
    const query_select = `SELECT * FROM ${vna.tables.clients} WHERE id_user="${data.id_user}";`;
    const query_update = `UPDATE ${vna.tables.clients} SET subscription = ? WHERE ${data.id_user}`;

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
              console.log(error);
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
          db.query(query_update, [data.subscription], (error, results) => {
            if (error) {
              console.log(error);
              return res.json({
                message: "Error mysql",
                status: false,
              });
            }

            return res.json({
              message: "Update client succefull",
              status: true,
            });
          });
        }
      });
    } catch (err) {
      console.log("ERROR EN LA CATCH");
      console.log({ message: err.message, status: false });
      res.json({ message: err.message, status: false });
      next(err);
    }
  };

export const sentNotificationNow =
  ({ message, title, id_users }) =>
  (req, res, next) => {
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

        res.status(200).json();
        for (let i = 0; id_users.length > i; i++) {
          const pushSubscripton = results.find((n) => {
            return n.id_user.toString() === id_users[i].toString();
          }).subscription;

          if (pushSubscripton)
            webpush.sendNotification(JSON.parse(pushSubscripton), payload);
        }

        return results;
      });
    } catch (err) {
      res.json({ message: err.message, status: false });
      next(err);
    }
  };

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

export const getAllData = (table_name) => (req, res, next) => {
  try {
    db.query(`SELECT * FROM ${table_name}`, (error, results) => {
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

export const getDataById = (table_name) => (req, res, next) => {
  const id_user = req.params.id;

  try {
    db.query(
      `SELECT * FROM ${table_name} WHERE id='${id_user}'`,
      (error, results) => {
        if (error) {
          console.error("Error: ", error);
          res.status(500).json({ error: "Error in select query" });
        } else {
          res.json(results);
        }
      }
    );
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

export const getAllDataByIdUserState =
  (table_name, limit = 0) =>
  (req, res, next) => {
    const { id_user } = req.params;

    try {
      db.query(
        `SELECT * FROM ${table_name} WHERE id_user='${id_user}' AND state='1' ${
          limit === 0 ? "" : "ORDER BY created_at DESC LIMIT " + limit
        };`,
        (error, results) => {
          if (error) {
            console.error("Error: ", error);
            res.status(500).json({ error: "Error in select query" });
          } else {
            res.json(results);
          }
        }
      );
    } catch (err) {
      res.json({ message: err.message });
      next(err);
    }
  };

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

export const createData = (table_name) => (req, res, next) => {
  const { query, values } = generarConsultaCreate(table_name, req.body);

  try {
    db.query(query, values, (error, results, ...otro) => {
      if (error) {
        console.error("Error: ", error);
        if (
          error.sqlState === "23000" &&
          table_name === VNA.tables_app.inscriptos
        ) {
          res.json({
            status: true,
            results,
            message: VNA.backend.reinicio,
          });
        } else
          res
            .status(500)
            .json({ error: "Error in create query", status: false });
      } else {
        res.json({
          status: true,
          results,
          message: "Creado con exitos",
        });
      }
    });
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

export const createDataMany = (table_name) => (req, res, next) => {
  const { query, values } = generarConsultaCreateMany(table_name, req.body);

  try {
    db.query(query, values, (error, results) => {
      if (error) {
        console.error("Error: ", error);
        if (error.sqlState === "23000")
          res.json({
            status: true,
            results,
            message: VNA.backend.reinicio,
          });
        else
          res
            .status(500)
            .json({ error: "Error in create query", status: false });
      } else {
        res.json({
          status: true,
          results,
          message: "Creado con exitos",
        });
      }
    });
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

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

export const deleteData = (table_name) => (req, res, next) => {
  try {
    db.query(
      `DELETE FROM ${table_name} WHERE id='${req.body.id}'`,
      (error, results) => {
        if (error) {
          console.error("Error: ", error);
          res
            .status(500)
            .json({ error: "Error in delete query", status: false });
        } else {
          res.json({
            status: true,
            results,
            message: "delete with successful",
          });
        }
      }
    );
  } catch (err) {
    res.json({ message: err.message });
    next(err);
  }
};

export const deleteDataToDobleId = (table_name) => (req, res, next) => {
  const name_id_first = req.body.name_id_first;
  const name_id_second = req.body.name_id_second;
  const id_first = req.body.id_first;
  const id_second = req.body.id_second;

  const condition = `${name_id_first}='${id_first}' AND ${name_id_second}='${id_second}'`;

  try {
    db.query(
      `DELETE FROM ${table_name} WHERE ${condition}`,
      (error, results) => {
        if (error) {
          console.error("Error: ", error);
          res
            .status(500)
            .json({ error: "Error in delete query", status: false });
        } else {
          res.json({
            status: true,
            results,
            message: "delete with successful",
          });
        }
      }
    );
  } catch (err) {
    console.log(err.message);
    res.json({ message: "Error al borrar" });
    next(err);
  }
};
