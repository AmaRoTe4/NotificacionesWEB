//todos estos son valores que se mandan en el body

//notification_create
const create_query_notification_body = {
  message: "",
  date_notifications: [
    {
      date: "aaaa-mm-dd",
      time: "hh:mm:ss",
      id_user: "id_client to app register local",
    },
  ],
};

//notification_now
const create_query_notification_now_body = {
  message: "",
  id_users: [""],
};

//unsubscription
const query_unsubscription = {
  id_user: "",
};

//notification_update
const update_query_notification = {
  id: "", //-> required
  ...more,
};

//notification_cancel
const query_notification_cancel = {
  id: "",
};
