export type AffiliateNetwork =
  | 'cj'
  | 'awin'
  | 'impact'
  | 'partnerize'
  | 'custom';

export interface AffiliateProgram {
  id: number;
  storeId: number;
  storeName: string;
  network: AffiliateNetwork;
  trackingUrlTemplate: string;
  commissionPercent: number | null;
  commissionFixed: number | null;
  cookieDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: number;
  name: string;
  domain: string;
  logoUrl: string | null;
  isActive: boolean;
  dealCount: number;
  clickCount: number;
  affiliatePrograms: AffiliateProgram[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  domain: string;
  logoUrl?: string;
}

export type UpdateStoreRequest = Partial<CreateStoreRequest>;

export interface CreateAffiliateProgramRequest {
  network: AffiliateNetwork;
  trackingUrlTemplate: string;
  commissionPercent?: number;
  commissionFixed?: number;
  cookieDays?: number;
  isActive?: boolean;
}

export type UpdateAffiliateProgramRequest = Partial<CreateAffiliateProgramRequest>;

/** ══ REPORTE DE AFILIACIÓN ══ */

export interface AffiliateReportParams {
  from: string;
  to: string;
  storeId?: number;
  network?: AffiliateNetwork;
}

export interface AffiliateReportSummary {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  avgOrderValue: number;
  period: { from: string; to: string };
}

export interface AffiliateReportRow {
  storeId: number;
  storeName: string;
  storeLogoUrl: string | null;
  network: AffiliateNetwork;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgCommission: number;
}

export interface AffiliateClickTimeSeries {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface AffiliateReport {
  summary: AffiliateReportSummary;
  byStore: AffiliateReportRow[];
  timeSeries: AffiliateClickTimeSeries[];
}
