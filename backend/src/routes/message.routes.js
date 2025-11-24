import { Router } from "express";
import { ensureAuth } from "../middlewares/auth.middleware.js";
import {
  sendMessageToUser,
  getMessagesBetweenUsers,
  getUserForSidebar,
} from "../controllers/message.contrtoller.js";
const router = Router();

router.get("/users", ensureAuth, getUserForSidebar);

router.get("/:id", ensureAuth, getMessagesBetweenUsers);

router.post("/send/:id", ensureAuth, sendMessageToUser);

export default router;
