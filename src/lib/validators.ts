import { z } from 'zod';

/** Constrains de validación alineados con el backend */
export const LIMITS = {
  DEAL_TITLE_MIN:   10,
  DEAL_TITLE_MAX:   200,
  DEAL_DESC_MAX:    5000,
  URL_MAX:          2048,
  SLUG_MAX:         255,
  META_TITLE_MAX:   70,
  META_DESC_MAX:    160,
  FAQ_Q_MAX:        500,
  FAQ_A_MAX:        2000,
  ANNOUNCEMENT_MAX: 500,
  BAN_REASON_MAX:   1000,
  USERNAME_MIN:     3,
  USERNAME_MAX:     30,
  PASSWORD_MIN:     8,
} as const;

export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(LIMITS.PASSWORD_MIN, `Mínimo ${LIMITS.PASSWORD_MIN} caracteres`),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const pageSchema = z.object({
  title:            z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  slug:             z.string().max(LIMITS.SLUG_MAX).optional(),
  content:          z.string().min(1, 'El contenido no puede estar vacío'),
  metaTitle:        z.string().max(LIMITS.META_TITLE_MAX, `Máximo ${LIMITS.META_TITLE_MAX} caracteres`).optional(),
  metaDescription:  z.string().max(LIMITS.META_DESC_MAX, `Máximo ${LIMITS.META_DESC_MAX} caracteres`).optional(),
  isPublished:      z.boolean().default(false),
});
export type PageFormData = z.infer<typeof pageSchema>;

export const bannerSchema = z.object({
  imageUrl:   z.string().url('URL inválida').max(LIMITS.URL_MAX),
  linkUrl:    z.string().url('URL inválida').max(LIMITS.URL_MAX),
  altText:    z.string().max(200, 'Máximo 200 caracteres').optional(),
  position:   z.enum(['homepage_top', 'category_sidebar', 'deal_detail_bottom']),
  displayOrder: z.number().int().min(0).default(0),
  startsAt:   z.string().optional(),
  endsAt:     z.string().optional(),
  isActive:   z.boolean().default(true),
});
export type BannerFormData = z.infer<typeof bannerSchema>;

export const faqSchema = z.object({
  question: z.string().min(5, 'Mínimo 5 caracteres').max(LIMITS.FAQ_Q_MAX),
  answer:   z.string().min(10, 'Mínimo 10 caracteres').max(LIMITS.FAQ_A_MAX),
  category: z.string().min(1, 'Selecciona una categoría'),
  displayOrder: z.number().int().min(0).default(0),
});
export type FaqFormData = z.infer<typeof faqSchema>;

export const announcementSchema = z.object({
  title:    z.string().min(3).max(200),
  body:     z.string().min(1).max(LIMITS.ANNOUNCEMENT_MAX),
  type:     z.enum(['info', 'warning', 'success', 'error']),
  startsAt: z.string(),
  endsAt:   z.string().optional(),
});
export type AnnouncementFormData = z.infer<typeof announcementSchema>;

export const eventSchema = z.object({
  name:        z.string().min(3).max(200),
  slug:        z.string().max(LIMITS.SLUG_MAX).optional(),
  description: z.string().max(2000).optional(),
  bannerUrl:   z.string().url('URL inválida').optional().or(z.literal('')),
  startsAt:    z.string(),
  endsAt:      z.string(),
  isActive:    z.boolean().default(false),
});
export type EventFormData = z.infer<typeof eventSchema>;

export const storeSchema = z.object({
  name:    z.string().min(2).max(200),
  domain:  z.string().min(3).max(200),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});
export type StoreFormData = z.infer<typeof storeSchema>;

export const categorySchema = z.object({
  name:         z.string().min(2).max(100),
  slug:         z.string().max(LIMITS.SLUG_MAX).optional(),
  icon:         z.string().optional(),
  parentId:     z.number().int().nullable().default(null),
  displayOrder: z.number().int().min(0).default(0),
});
export type CategoryFormData = z.infer<typeof categorySchema>;

export const banUserSchema = z.object({
  reason:    z.string().min(5, 'Indica el motivo del baneo').max(LIMITS.BAN_REASON_MAX),
  expiresAt: z.string().optional(),
});
export type BanUserFormData = z.infer<typeof banUserSchema>;

export const bannedWordSchema = z.object({
  word:     z.string().min(1).max(100),
  severity: z.enum(['low', 'medium', 'high']),
});
export type BannedWordFormData = z.infer<typeof bannedWordSchema>;

export const ipBanSchema = z.object({
  ipAddress: z
    .string()
    .regex(
      /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
      'Ingresa una IP válida (ej: 192.168.1.1 o 10.0.0.0/24)'
    ),
  reason:    z.string().min(5).max(500),
  expiresAt: z.string().optional(),
});
export type IpBanFormData = z.infer<typeof ipBanSchema>;
