"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, ID } from "../appwrite";
import { OAuthProvider } from "appwrite";
import Footer from "../footer/Footer";

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

    // Check session on initial load
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10">
      {/* Header */}
      <div className="navbar bg-base-100/80 backdrop-blur-sm shadow-lg">
        <div className="flex-1">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="text-3xl">💪</span>
            HabitPulse
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="hero min-h-[calc(100vh-4rem)]">
        <div className="hero-content flex-col lg:flex-row-reverse max-w-6xl">
          {/* Right Side - Features */}
          <div className="text-center lg:text-left lg:w-1/2">
            <div className="space-y-6">
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Level Up Your Life
              </h1>
              <p className="text-xl text-base-content/80 leading-relaxed">
                Transform your daily habits into an epic RPG adventure. Gain XP, level up, and build the life you've always wanted.
              </p>
              
              {/* Feature Cards */}
              <div className="grid gap-4 mt-8">
                <div className="flex items-center gap-4 p-4 bg-base-100/50 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-semibold text-primary">Build Streaks</h3>
                    <p className="text-sm text-base-content/70">Maintain consistency and watch your streaks grow</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-base-100/50 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h3 className="font-semibold text-secondary">Gain Experience</h3>
                    <p className="text-sm text-base-content/70">Every completed habit earns you XP and levels</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-base-100/50 rounded-lg backdrop-blur-sm">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-semibold text-accent">Track Progress</h3>
                    <p className="text-sm text-base-content/70">Visualize your growth with beautiful analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Side - Login Card */}
          <div className="lg:w-1/2 w-full max-w-md">
            <div className="card bg-base-100 shadow-2xl border border-base-300/50">
              <div className="card-body p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">✨</div>
                  <h2 className="card-title text-2xl justify-center mb-2">Welcome Back!</h2>
                  <p className="text-base-content/70">Ready to continue your journey?</p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    type="button" 
                    id="btn-siwg" 
                    className="btn btn-primary btn-lg w-full gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    onClick={loginSIWG}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  <div className="divider text-sm text-base-content/50">Quick & Secure</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;