"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

type AuthMode = "existing" | "new";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as AuthMode) || "existing";

  // const supabase = createBrowserClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // try {
    //   if (mode === "existing") {
    //     const { error } = await supabase.auth.signInWithPassword({
    //       email,
    //       password,
    //     });

    //     if (error) {
    //       toast.error(error.message);
    //       return;
    //     }

    //     toast.success("Welcome back! Let's crush your fitness goals!");
    //   } else {
    //     const { error } = await supabase.auth.signUp({
    //       email,
    //       password,
    //       options: {
    //         emailRedirectTo: `${window.location.origin}/auth/callback`,
    //       },
    //     });

    //     if (error) {
    //       toast.error(error.message);
    //       return;
    //     }

    //     toast.success("Account created! Check your email to verify your account.");
    //   }

    //   router.push("/dashboard");
    //   router.refresh();
    // } catch (error) {
    //   toast.error("Something went wrong. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    // try {
    //   const { error } = await supabase.auth.signInWithOAuth({
    //     provider,
    //     options: {
    //       redirectTo: `${window.location.origin}/auth/callback`,
    //     },
    //   });

    //   if (error) {
    //     toast.error(error.message);
    //   }
    // } catch (error) {
    //   toast.error("Something went wrong. Please try again.");
    // } finally {
    //   setSocialLoading(null);
    // }
  };

  const toggleMode = () => {
    const newMode = mode === "existing" ? "new" : "existing";
    router.push(`/auth/sign-in?mode=${newMode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {mode === "existing" ? "Welcome Back" : "Join the Movement"}
          </h1>
          <p className="text-gray-400">
            {mode === "existing"
              ? "Ready to push your limits?"
              : "Start your fitness journey today"}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialSignIn("google")}
            disabled={!!socialLoading}
            className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {socialLoading === "google" ? "Connecting..." : "Continue with Google"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialSignIn("apple")}
            disabled={!!socialLoading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.89 3.51-.84 1.54.07 2.7.61 3.44 1.57-3.14 1.88-2.29 5.13.89 6.41-.65 1.29-1.51 2.58-2.92 4.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {socialLoading === "apple" ? "Connecting..." : "Continue with Apple"}
          </motion.button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? mode === "existing"
                ? "Signing in..."
                : "Creating account..."
              : mode === "existing"
                ? "Sign In"
                : "Create Account"}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            {mode === "existing" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={toggleMode}
              className="text-red-500 hover:text-red-400 font-semibold"
            >
              {mode === "existing" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm italic">
            "Just Do It. Your future self will thank you."
          </p>
        </div>
      </motion.div>
    </div>
  );
}