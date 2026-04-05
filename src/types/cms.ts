/** ══ PÁGINAS ESTÁTICAS ══ */

export type PageStatus = 'published' | 'draft';

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: PageStatus;
  isPublished: boolean;
  authorId: number;
  authorUsername: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageRequest {
  title: string;
  slug?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
}

export type UpdatePageRequest = Partial<CreatePageRequest>;

/** ══ BANNERS PUBLICITARIOS ══ */

export type BannerPosition =
  | 'homepage_top'
  | 'category_sidebar'
  | 'deal_detail_bottom';

export interface Banner {
  id: number;
  imageUrl: string;
  linkUrl: string;
  altText: string | null;
  position: BannerPosition;
  displayOrder: number;
  isActive: boolean;
  clickCount: number;
  impressionCount: number;
  ctr: number;
  startsAt: string | null;
  endsAt: string | null;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  imageUrl: string;
  linkUrl: string;
  altText?: string;
  position: BannerPosition;
  displayOrder?: number;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export type UpdateBannerRequest = Partial<CreateBannerRequest>;

export interface ReorderBannersRequest {
  items: Array<{ id: number; displayOrder: number }>;
}

/** ══ FAQs ══ */

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isPublished: boolean;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  category: string;
  displayOrder?: number;
}

export type UpdateFaqRequest = Partial<CreateFaqRequest>;

export interface ReorderFaqsRequest {
  items: Array<{ id: number; displayOrder: number }>;
}

/** ══ ANUNCIOS DEL SITIO ══ */

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';

export interface Announcement {
  id: number;
  title: string;
  body: string;
  type: AnnouncementType;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  type: AnnouncementType;
  startsAt: string;
  endsAt?: string;
}

export type UpdateAnnouncementRequest = Partial<CreateAnnouncementRequest>;

/** ══ EVENTOS COMERCIALES ══ */

export interface CommercialEvent {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
  isActive: boolean;
  dealCount: number;
  startsAt: string;
  endsAt: string;
  createdById: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  slug?: string;
  description?: string;
  bannerUrl?: string;
  isActive?: boolean;
  startsAt: string;
  endsAt: string;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;
