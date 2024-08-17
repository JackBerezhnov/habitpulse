"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, ID } from "../appwrite.ts";

interface User {
  $id: string;
  name: string;
  email: string;
}

const LoginPage: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
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

  const register = async () => {
    try {
      await account.create(ID.unique(), email, password, name);
      await login(email, password);
    } catch (error) {
      console.error("Failed to register:", error);
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
    return <p>Loading...</p>;
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
    <div>
      <p>Not logged in</p>
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={() => login(email, password)}>
          Login
        </button>
        <button type="button" onClick={register}>
          Register
        </button>
      </form>
    </div>
  );
};

export default LoginPage;