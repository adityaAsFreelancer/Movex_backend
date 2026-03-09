import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Partner } from '../models/Partner';
import { Product } from '../models/Product';

export const getVendors = async (req: Request, res: Response) => {
    try {
        const type = req.query.type as string; // 'FOOD', 'PHARMACY'
        
        const partnerRepo = AppDataSource.getRepository(Partner);
        
        let query = partnerRepo.createQueryBuilder('partner')
            .leftJoinAndSelect('partner.products', 'product')
            .where('partner.status = :status', { status: 'Active' });

        if (type) {
            query = query.andWhere('partner.category = :category', { category: type });
        }

        const vendors = await query.getMany();
        
        return res.json({ vendors });
    } catch (error) {
        console.error('getVendors error:', error);
        return res.status(500).json({ error: 'Failed to fetch vendors' });
    }
};

export const getMyProducts = async (req: any, res: Response) => {
    try {
        const partnerRepo = AppDataSource.getRepository(Partner);
        const partner = await partnerRepo.findOne({ where: { owner: { _id: req.user.id } }, relations: ['products'] });
        if (!partner) return res.status(404).json({ error: 'Partner not found' });
        return res.json({ products: partner.products });
    } catch (error) {
        return res.status(500).json({ error: 'Failed' });
    }
};

export const addProduct = async (req: any, res: Response) => {
    try {
        const { name, price, description, category, image } = req.body;
        const partnerRepo = AppDataSource.getRepository(Partner);
        const productRepo = AppDataSource.getRepository(Product);
        const partner = await partnerRepo.findOne({ where: { owner: { _id: req.user.id } } });
        if (!partner) return res.status(404).json({ error: 'Partner not found' });

        const product = productRepo.create({
            name,
            price: parseFloat(price),
            description,
            category,
            image,
            vendor: partner
        });
        await productRepo.save(product);
        return res.json({ success: true, product });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to add product' });
    }
};

export const deleteProduct = async (req: any, res: Response) => {
    try {
        const productRepo = AppDataSource.getRepository(Product);
        const product = await productRepo.findOne({ where: { _id: req.params.productId }, relations: ['vendor', 'vendor.owner'] });
        if (!product || product.vendor.owner._id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await productRepo.remove(product);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete' });
    }
};
