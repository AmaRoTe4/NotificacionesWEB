import { Router } from "express";
import vna from "../const/vna.js";
import {
  sentNotificationNow,
  createQueryNotification,
  getAllNotifications,
  getAllDataWithState,
  updateData,
  lowLogic,
  lowLogicClientByIdUser,
  getAllNextNotification,
} from "../controllers/controllers.js";

const router = Router();

//router.post(vna.path.subscription, (req, res, next) => {
//  const middleware = createQueryClient();
//  middleware(req, res, next);
//});

router.post(vna.path.notification_now, async (req, res, next) => {
  const middleware = sentNotificationNow();
  await middleware(req, res, next);
});

router.post(vna.path.notification_create, async (req, res, next) => {
  const middleware = createQueryNotification();
  await middleware(req, res, next);
});

router.get(
  vna.path.all_notification,
  async (req, res, next) => await getAllNotifications(req, res, next)
);
router.get(
  vna.path.next_notification,
  async (req, res, next) => await getAllNextNotification(req, res, next)
);

router.get(vna.path.all_subscription, async (req, res, next) => {
  const middleware = getAllDataWithState(vna.tables.clients);
  await middleware(req, res, next);
});

router.post(vna.path.unsubscription, async (req, res, next) => {
  await lowLogicClientByIdUser(req, res, next);
});

router.post(vna.path.notification_cancel, async (req, res, next) => {
  const middleware = lowLogic(vna.tables.notifications);
  await middleware(req, res, next);
});

router.post(vna.path.notification_update, async (req, res, next) => {
  const middleware = updateData(vna.tables.notifications);
  await middleware(req, res, next);
});

export default router;
