export type DealStatus =
  | 'pending'
  | 'active'
  | 'expired'
  | 'sold_out'
  | 'rejected'
  | 'deleted';

export interface DealAuthor {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  reputation: number;
}

export interface DealCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export interface DealStore {
  id: number;
  name: string;
  domain: string;
  logoUrl: string | null;
}

export interface Deal {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  price: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  couponCode: string | null;
  temperature: number;
  status: DealStatus;
  isFeatured: boolean;
  isSponsored: boolean;
  viewCount: number;
  clickCount: number;
  commentCount: number;
  voteCount: number;
  author: DealAuthor;
  category: DealCategory | null;
  store: DealStore | null;
  commercialEventId: number | null;
  expiresAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DealPriceHistory {
  id: number;
  dealId: number;
  price: number;
  source: string;
  recordedAt: string;
}

export interface DealEditHistoryItem {
  id: number;
  dealId: number;
  editorId: number;
  editorUsername: string;
  changedFields: string[];
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  createdAt: string;
}

/** Parámetros de filtrado para la lista de deals */
export interface DealListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DealStatus | '';
  categoryId?: number | '';
  storeId?: number | '';
  isFeatured?: boolean;
  isSponsored?: boolean;
  tempMin?: number;
  tempMax?: number;
  sortBy?: 'createdAt' | 'temperature' | 'clickCount' | 'price';
  sortDir?: 'asc' | 'desc';
  from?: string;
  to?: string;
  includeDeleted?: boolean;
}

export interface ChangeDealStatusRequest {
  status: DealStatus;
  reason?: string;
}

export interface FeatureDealRequest {
  isFeatured: boolean;
}
