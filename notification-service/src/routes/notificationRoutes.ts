import { Router } from "express";
import { getUserNotifications, markAsRead } from "../services/notificationService";

const router = Router();

router.get("/:userId", async (req, res) => {
  const notifs = await getUserNotifications(req.params.userId);
  res.json(notifs);
});

router.patch("/:id/read", async (req, res) => {
  const updated = await markAsRead(req.params.id);
  res.json(updated);
});

export default router;
