"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, ID } from "../appwrite";
import { OAuthProvider } from "appwrite";

interface User {
  $id: string;
  name: string;
  email: string;
}

const LoginPage: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if session exists first to avoid 401 errors
        const userSession = await account.getSession('current').catch(e => null);
        
        if (userSession) {
          // Session exists, now safely get user data
          const user = await account.get<User>();
          setLoggedInUser(user);
          router.push("/"); // Redirect to home if logged in
        } else {
          // No session found - user needs to login
          setLoggedInUser(null);
        }
      } catch (error) {
        // Silently handle session check errors
        setLoggedInUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const loginSIWG = async () => {
    account.createOAuth2Session(
      OAuthProvider.Google,
      "https://habitpulse-git-master-jackberezhnovs-projects.vercel.app/"
    )
  }

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setLoggedInUser(null);
    } catch (error) {
      // Silently handle logout errors
    }
  };

  if (loading) {
    return <div className="flex flex-col justify-center items-center gap-8 hero bg-base-200 h-[100vh]">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (loggedInUser) {
    return (
      <div>
        <p>Logged in as {loggedInUser.name}</p>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="hero bg-base-200 min-h-screen">
      <form>
        <button type="button" id="btn-siwg" className="btn btn-primary" onClick={loginSIWG}>
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default LoginPage;