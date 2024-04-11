import { Router } from "express";
import vna from "../const/vna.js";
import {
  sentNotificationNow,
  createQueryClient,
} from "../controllers/controllers.js";
import newUUID from "../functions/newUUID.js";

const router = Router();

router.post(vna.path.subscription, (req, res, next) => {
  const subscription = req.body.subscription;
  const id_user = req.body.id_user;

  const data = {
    id_user,
    id: newUUID(),
    subscription: JSON.stringify(subscription),
  };

  const middleware = createQueryClient({
    data,
  });

  middleware(req, res, next);
});

router.post(vna.path.notification_now, (req, res, next) => {
  const { message, title, id_users } = req.body;

  try {
    const middleware = sentNotificationNow({
      message,
      title,
      id_users,
    });
    middleware(req, res, next);
  } catch (error) {
    console.log(error);
  }
});

export default router;
