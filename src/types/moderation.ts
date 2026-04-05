export type ModerationItemType = 'deal' | 'comment' | 'user';
export type ModerationAction =
  | 'approve'
  | 'reject'
  | 'delete'
  | 'warn'
  | 'ban'
  | 'ignore';
export type ReportReason =
  | 'wrong_price'
  | 'expired'
  | 'duplicate'
  | 'spam'
  | 'inappropriate'
  | 'misleading'
  | 'other';

export interface ModerationItem {
  id: number;
  type: ModerationItemType;
  status: 'pending' | 'resolved' | 'ignored';
  reportCount: number;
  reportReason: ReportReason;
  reporterNote: string | null;
  resolvedAction: ModerationAction | null;
  resolvedById: number | null;
  resolvedByUsername: string | null;
  resolvedAt: string | null;
  createdAt: string;

  /** Contenido del item reportado */
  entity: ModerationDealEntity | ModerationCommentEntity | ModerationUserEntity;
}

export interface ModerationDealEntity {
  kind: 'deal';
  id: number;
  title: string;
  url: string;
  price: number | null;
  temperature: number;
  status: string;
  authorUsername: string;
  authorId: number;
  createdAt: string;
}

export interface ModerationCommentEntity {
  kind: 'comment';
  id: number;
  body: string;
  dealId: number;
  dealTitle: string;
  authorUsername: string;
  authorId: number;
  createdAt: string;
}

export interface ModerationUserEntity {
  kind: 'user';
  id: number;
  username: string;
  email: string;
  reputation: number;
  isBanned: boolean;
  createdAt: string;
}

export interface ModerationListParams {
  page?: number;
  limit?: number;
  type?: ModerationItemType | '';
  status?: 'pending' | 'resolved' | 'ignored' | '';
}

export interface ResolveModerationRequest {
  action: ModerationAction;
  reason?: string;
}

export interface ModerationStats {
  pendingDeals: number;
  pendingComments: number;
  pendingUsers: number;
  resolvedToday: number;
  avgResolutionMinutes: number;
}
