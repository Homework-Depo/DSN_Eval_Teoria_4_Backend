import { Router } from "express";
import * as controller from "./controller";
import validateToken from "../../middleware/verifyToken";

const router = Router();

router.post("/", validateToken, controller.logout);

export default router;