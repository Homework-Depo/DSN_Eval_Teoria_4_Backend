import { Router } from 'express';
import { verify } from './controller';

const router = Router();

router.post('/', verify);

export default router;