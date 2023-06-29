import { Router } from 'express';
import * as controller from './controller';

const router = Router();

router.post('/send', controller.passwordResetRequest);

export default router;

