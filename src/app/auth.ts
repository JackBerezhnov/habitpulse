import { account, OAuthProvider } from './appwrite';
import { useRouter } from "next/navigation";

const router = useRouter();

export const loginWithGoogle = async () => {
  try {
    await account.createOAuth2Session(OAuthProvider.Google)
    router.push("/");
  } catch (error) {
    console.error(error)
  }
}

export const logoutUser = async () => {
  try {
    await account.deleteSession('current')
    router.push("/login");
  } catch (error) {
    console.error(error)
  }
}

export const getUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    console.error(error)
  }
}