import { Router } from "express";
import * as controller from "./controller";
import validateOtpToken from "../../middleware/validateOtpToken";

const router = Router();

router.post("/", controller.login);
router.post("/otp", validateOtpToken, controller.validateOtp);

export default router;