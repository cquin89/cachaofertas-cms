export type NotificationType =
  | 'deal_hot'
  | 'deal_expired'
  | 'deal_commented'
  | 'deal_voted'
  | 'user_banned'
  | 'user_warned'
  | 'badge_earned'
  | 'system';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  entityType: string | null;
  entityId: number | null;
  createdAt: string;
}

export interface NotificationPreferences {
  emailDealsAlert: boolean;
  emailNewsletter: boolean;
  pushDealsAlert: boolean;
  pushComments: boolean;
  pushBadges: boolean;
}
