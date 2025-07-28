import { account, OAuthProvider } from './appwrite';

export const loginWithGoogle = async () => {
  try {
    await account.createOAuth2Session(
        OAuthProvider.Google,
        "https://app.habit-pulse.com/"
    )
  } catch (error) {
    console.error(error)
  }
}

export const logoutUser = async () => {
  try {
    await account.deleteSession('current')
  } catch (error) {
    console.error(error)
  }
}

export const getUserData = async (retries = 3, delay = 500): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const user = await account.get();
      return user;
    } catch (error: any) {
      if (i === retries - 1) throw error;
      console.warn(`Retrying account.get()... (${i + 1})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}