import { Router } from "express";
import * as controller from "./controller";
import validateToken from "../../middleware/verifyToken";

const router = Router();

router.get("/", validateToken, controller.getUser);

export default router;