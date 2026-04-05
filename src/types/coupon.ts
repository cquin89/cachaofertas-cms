export type CouponStatus = 'active' | 'expired' | 'unverified' | 'rejected';
export type CouponType = 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y' | 'other';

export interface Coupon {
  id: number;
  code: string;
  title: string;
  description: string | null;
  type: CouponType;
  value: number | null;
  minPurchase: number | null;
  maxDiscount: number | null;
  status: CouponStatus;
  usageCount: number;
  maxUsage: number | null;
  storeId: number;
  storeName: string;
  storeLogoUrl: string | null;
  submittedById: number;
  submittedByUsername: string;
  verifiedById: number | null;
  verifiedByUsername: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CouponListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CouponStatus | '';
  storeId?: number | '';
  type?: CouponType | '';
  sortBy?: 'createdAt' | 'usageCount' | 'expiresAt';
  sortDir?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface ChangeCouponStatusRequest {
  status: CouponStatus;
  reason?: string;
}
