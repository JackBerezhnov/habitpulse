import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

const getRedirectUrl = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/`;
};

export const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export const getUserData = async (retries = 3, delay = 500): Promise<User | null> => {
  for (let i = 0; i < retries; i += 1) {
    const { data, error } = await supabase.auth.getUser();

    if (!error) {
      return data.user;
    }

    if (i === retries - 1) {
      throw error;
    }

    console.warn(`Retrying supabase.auth.getUser()... (${i + 1})`);
    await new Promise((res) => setTimeout(res, delay));
  }

  return null;
};