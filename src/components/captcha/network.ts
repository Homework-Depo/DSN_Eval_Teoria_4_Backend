import { Router } from 'express';
import { captcha } from './controller';

const router = Router();

router.post("/", captcha);

export default router;