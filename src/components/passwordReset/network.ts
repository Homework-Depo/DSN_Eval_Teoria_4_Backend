import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.post('/send', controller.passwordResetRequest);
router.post("/submit", controller.submit);

export default router;

