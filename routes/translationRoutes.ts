import express from 'express';
import { getTranslations, seedTranslations } from '../controllers/translationController';

const router = express.Router();

router.get('/:lang', getTranslations);
router.post('/seed', seedTranslations);

export default router;
