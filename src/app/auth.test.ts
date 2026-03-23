import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSignInWithOAuth, mockSignOut, mockGetUser } = vi.hoisted(() => ({
  mockSignInWithOAuth: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  },
}));

import { loginWithGoogle, logoutUser, getUserData } from './auth';

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginWithGoogle', () => {
    it('calls signInWithOAuth with google provider', async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      await loginWithGoogle();

      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'google' }),
      );
    });

    it('throws when signInWithOAuth returns an error', async () => {
      const authError = new Error('OAuth failed');
      mockSignInWithOAuth.mockResolvedValue({ error: authError });

      await expect(loginWithGoogle()).rejects.toThrow('OAuth failed');
    });
  });

  describe('logoutUser', () => {
    it('calls signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await logoutUser();

      expect(mockSignOut).toHaveBeenCalledOnce();
    });

    it('throws when signOut returns an error', async () => {
      const authError = new Error('Signout failed');
      mockSignOut.mockResolvedValue({ error: authError });

      await expect(logoutUser()).rejects.toThrow('Signout failed');
    });
  });

  describe('getUserData', () => {
    it('returns user on first successful attempt', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await getUserData();

      expect(result).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalledOnce();
    });

    it('retries on failure and returns user on success', async () => {
      const mockUser = { id: 'u1', email: 'test@example.com' };
      mockGetUser
        .mockResolvedValueOnce({ data: {}, error: new Error('Temp error') })
        .mockResolvedValueOnce({ data: { user: mockUser }, error: null });

      const result = await getUserData(3, 10); // short delay for test speed

      expect(result).toEqual(mockUser);
      expect(mockGetUser).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting all retries', async () => {
      mockGetUser.mockResolvedValue({ data: {}, error: new Error('Persistent error') });

      await expect(getUserData(2, 10)).rejects.toThrow('Persistent error');
      expect(mockGetUser).toHaveBeenCalledTimes(2);
    });
  });
});
