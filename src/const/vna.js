export default {
  tables: {
    clients: "clients",
    date_notifications: "date_notifications",
    notifications: "notifications",
  },
  type_dispositivo: {
    apple: "2",
    another: "1",
  },
  defaultTimer: "*/10 * * * * *",
  timer_to_minits: 15,
  path: {
    subscription: "/subscription/",
    unsubscription: "/unsubscription/",
    notification_create: "/notification_create/",
    notification_edit: "/notification_edit/",
    notification_cancel: "/notification_cancel/",
    notification_now: "/notification_now/",
    next_notification: "/next_notification/",
    all_notification: "/all_notification/",
    all_subscription: "/all_subscription/",
  },
  status_app: {
    dev: "dev",
    product: "product",
  },
};
