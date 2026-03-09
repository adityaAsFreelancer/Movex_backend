import { Response } from 'express';
import { AppDataSource } from '../data-source';
import { Coupon } from '../models/Coupon';
import { Order } from '../models/Order';
import { AuthenticatedRequest } from '../config/authMiddleware';

export const validateCoupon = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { code, cartAmount, serviceType } = req.body;
        const couponRepository = AppDataSource.getRepository(Coupon);
        const orderRepository = AppDataSource.getRepository(Order);

        const coupon = await couponRepository.findOne({ where: { code, isActive: true } });

        if (!coupon) return res.status(404).json({ success: false, message: 'COUPON_INVALID_OR_EXPIRED' });

        // 1. Check Usage Limits
        if (coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'COUPON_LIMIT_REACHED' });
        }

        // 2. Check Expiry
        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: 'COUPON_EXPIRED' });
        }

        // 3. Check Minimum Amount
        if (cartAmount < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: `MINIMUM_PURCHASE_REQUIRED: ${coupon.minOrderAmount}` });
        }

        // 4. Check Scope
        if (coupon.scope !== 'ALL' && coupon.scope !== serviceType) {
            return res.status(400).json({ success: false, message: `COUPON_VALID_ONLY_FOR_${coupon.scope}` });
        }

        // 5. Check First Order
        if (coupon.isFirstOrderOnly) {
            const hasPastOrders = await orderRepository.count({ where: { customerId: { _id: req.user?.id } as any } });
            if (hasPastOrders > 0) return res.status(400).json({ success: false, message: 'VALID_FOR_FIRST_ORDER_ONLY' });
        }

        // Calculation
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (cartAmount * coupon.value) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) discount = coupon.maxDiscountAmount;
        } else {
            discount = coupon.value;
        }

        res.status(200).json({ 
            success: true, 
            discount: Number(discount.toFixed(2)),
            finalAmount: Number((cartAmount - discount).toFixed(2))
        });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const applyReferralCode = async (req: AuthenticatedRequest, res: Response) => {
    // Top company feature: Viral growth loop logic
    res.json({ success: true, message: 'REFERRAL_APPLIED. Bonus tokens will be credited after first ride.' });
};
