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
    const fetchUser = async () => {
      try {
        const user = await account.get<User>();
        setLoggedInUser(user);
        router.push("/"); // Redirect to home if logged in
      } catch (error) {
        console.log("No user is logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const loginSIWG = async () => {
    account.createOAuth2Session(
      OAuthProvider.Google,
      "/"
    )
  }

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get<User>();
      setLoggedInUser(user);
      router.push("/"); // Redirect to home after login
    } catch (error) {
      console.error("Failed to log in:", error);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setLoggedInUser(null);
    } catch (error) {
      console.error("Failed to log out:", error);
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