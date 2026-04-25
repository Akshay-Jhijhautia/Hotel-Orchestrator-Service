import { Router } from 'express';
import { getSupplierA, getSupplierB } from '../controllers/supplier.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/supplierA/hotels', asyncHandler(getSupplierA));
router.get('/supplierB/hotels', asyncHandler(getSupplierB));

export default router;
