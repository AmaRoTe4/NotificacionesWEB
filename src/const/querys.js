import vna from "./vna.js";

export const date_notification_sent_cron = ({ time, date }) =>
  `SELECT
    dn.id as id, 
    dn.id_notificacion as id_notificacion, 
    dn.id_user as id_user 
  FROM ${vna.tables.date_notifications} as dn 
    WHERE dn.date='${date}' AND dn.time='${time}' AND dn.status_notificado='0' AND dn.state='1';
  `;

export const marcar_sent_to_date_not_by_id = ({ id }) =>
  `UPDATE ${vna.tables.date_notifications} SET status_notificado="1" WHERE id="${id}";`;

export const selectAllClientStatus = () =>
  `SELECT * FROM ${vna.tables.clients} as c WHERE c.state='1';`;

export const selectAllNotificacionesByIds = ({ ids }) => {
  const where_ids = ids
    .map((n) => {
      return `n.id="${n}"`;
    })
    .join(" OR ");

  return `SELECT * FROM ${vna.tables.notifications} as n WHERE n.state='1' AND (${where_ids});`;
};

export const selectAllClientsByIds = ({ ids }) => {
  const where_ids = ids
    .map((n) => {
      return `c.id_user="${n}"`;
    })
    .join(" OR ");

  return `SELECT * FROM ${vna.tables.clients} as c WHERE c.state='1' AND (${where_ids});`;
};

export const get_all_next_notifications = `
    SELECT 
        c.id_user as id_user, 
        n.message as message, 
        dn.status_notificado as status_notificado, 
        STR_TO_DATE(CONCAT(dn.date, ' ', dn.time), '%Y-%m-%d %H:%i:%s') AS combined_datetime 
    FROM ${vna.tables.date_notifications} as dn 
        JOIN ${vna.tables.notifications} as n ON n.id=dn.id_notificacion 
        JOIN ${vna.tables.clients} as c ON c.id_user=dn.id_user
    WHERE
        c.state="1" AND 
        dn.state="1" AND 
        n.state="1" AND 
        dn.status_notificado='0' 
    ORDER BY combined_datetime ASC;`;

export const get_all_notifications = `
SELECT 
    c.id_user as id_user, 
    n.message as message, 
    dn.status_notificado as status_notificado, 
    STR_TO_DATE(CONCAT(dn.date, ' ', dn.time), '%Y-%m-%d %H:%i:%s') AS combined_datetime 
FROM ${vna.tables.date_notifications} as dn 
    JOIN ${vna.tables.notifications} as n ON n.id=dn.id_notificacion 
    JOIN ${vna.tables.clients} as c ON c.id_user=dn.id_user
WHERE
    c.state="1" AND 
    dn.state="1" AND 
    n.state="1"
ORDER BY combined_datetime ASC;`;

export const low_logic_client_by_id_user = ({ id_user }) => {
  return `UPDATE ${vna.tables.clients} SET state='0' WHERE id_user="${id_user}"`;
};
