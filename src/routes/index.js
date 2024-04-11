import { Router } from "express";
import vna from "../const/vna.js";
import {
  sentNotificationNow,
  createQueryClient,
  createQueryNotification,
  getAllNotificationsByDataAndTime,
  getAllNotificationsByDataAndTimeNoView,
  getAllDataWithState,
  updateData,
  lowLogic,
  lowLogicClientByIdUser,
} from "../controllers/controllers.js";

const router = Router();

router.post(vna.path.subscription, (req, res, next) => {
  const middleware = createQueryClient();
  middleware(req, res, next);
});

router.post(vna.path.notification_now, (req, res, next) => {
  const middleware = sentNotificationNow();
  middleware(req, res, next);
});

router.post(vna.path.notification_create, (req, res, next) => {
  const middleware = createQueryNotification();
  middleware(req, res, next);
});

router.get(vna.path.all_notification, getAllNotificationsByDataAndTime);
router.get(vna.path.next_notification, getAllNotificationsByDataAndTimeNoView);

router.get(vna.path.all_subscription, (req, res, next) => {
  const middleware = getAllDataWithState(vna.tables.clients);
  middleware(req, res, next);
});

router.post(vna.path.unsubscription, (req, res, next) => {
  const middleware = lowLogic(vna.tables.clients);
  middleware(req, res, next);
});

router.post(vna.path.unsubscription + "user/:id_user", (req, res, next) => {
  const middleware = lowLogicClientByIdUser(vna.tables.clients);
  middleware(req, res, next);
});

router.post(vna.path.notification_cancel, (req, res, next) => {
  const middleware = lowLogic(vna.tables.notifications);
  middleware(req, res, next);
});

router.post(vna.path.notification_edit, (req, res, next) => {
  const middleware = updateData(vna.tables.notifications);
  middleware(req, res, next);
});

export default router;
