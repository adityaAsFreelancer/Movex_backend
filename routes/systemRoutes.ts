import express from 'express';
import { getSystemStatus, toggleMaintenance, getSystemStats, getSystemLogs } from '../controllers/systemController';
import { auth, roleGuard } from '../config/authMiddleware';

const router = express.Router();

router.get('/status', auth as any, getSystemStatus);
router.get('/stats', auth as any, roleGuard(['admin']), getSystemStats);
router.get('/logs', auth as any, roleGuard(['admin']), getSystemLogs);
router.post('/toggle-maintenance', auth as any, roleGuard(['admin']), toggleMaintenance);

export default router;
