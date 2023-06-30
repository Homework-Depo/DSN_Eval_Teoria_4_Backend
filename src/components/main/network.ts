import { Router } from "express";
import * as controller from "./controller";
import validateToken from "../../middleware/verifyToken";

const router = Router();

router.get("/", validateToken, controller.getUser);
router.post("/disable", validateToken, controller.disable2fa);
router.post("/enable", validateToken, controller.enable2fa);

export default router;