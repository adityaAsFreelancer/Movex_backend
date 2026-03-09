import express from 'express';
import { validateCoupon, applyReferralCode } from '../controllers/marketingController';
import { auth } from '../config/authMiddleware';

const router = express.Router();

router.post('/validate-coupon', auth as any, validateCoupon);
router.post('/apply-referral', auth as any, applyReferralCode);

export default router;
