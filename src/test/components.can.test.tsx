import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from './utils';
import { Can } from '@/components/shared/Can';
import { useAuthStore } from '@/stores/authStore';

function setRole(role: string) {
  useAuthStore.setState({
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'test',
      displayName: 'Test',
      avatarUrl: null,
      role: role as ReturnType<typeof useAuthStore.getState>['user']['role'],
    },
    isAuthenticated: true,
    accessToken: 'tok',
    refreshToken: 'ref',
  });
}

describe('Can', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  });

  it('renders children when user has permission', () => {
    setRole('admin');
    render(<Can perform="deals:delete"><span>Delete</span></Can>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders fallback when user lacks permission', () => {
    setRole('content_editor');
    render(
      <Can perform="users:ban" fallback={<span>No access</span>}>
        <span>Ban user</span>
      </Can>
    );
    expect(screen.queryByText('Ban user')).not.toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('super_admin can perform any action', () => {
    setRole('super_admin');
    render(<Can perform="any:action"><span>Super action</span></Can>);
    expect(screen.getByText('Super action')).toBeInTheDocument();
  });

  it('renders nothing (no fallback) when lacks permission', () => {
    setRole('content_editor');
    render(
      <Can perform="users:ban">
        <span>Ban user</span>
      </Can>
    );
    expect(screen.queryByText('Ban user')).not.toBeInTheDocument();
  });
});
