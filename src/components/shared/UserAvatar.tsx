import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
  displayName: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ displayName, avatarUrl, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar
      src={avatarUrl}
      alt={displayName}
      fallback={getInitials(displayName)}
      size={size}
      className={className}
    />
  );
}
