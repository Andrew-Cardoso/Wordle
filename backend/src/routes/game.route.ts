import express from 'express';
import {check, end, start} from '../controllers/game.controller';

const router = express.Router();

router.get('/', start);
router.post('/', check);
router.delete('/', end);

export default router;
