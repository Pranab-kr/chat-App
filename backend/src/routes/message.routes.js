import {Router} from "express";
import { ensureAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", ensureAuth, getUserForSidebar);

export default router;
