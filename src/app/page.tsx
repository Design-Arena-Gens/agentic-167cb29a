"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ArrowRight, Loader2, LogOut, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Mode = "sign-in" | "sign-up";
type AuthError = { message: string } | null;

const heroGradient =
  "radial-gradient(circle at top, rgba(59,130,246,0.15), transparent 55%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(circle at 80% 85%, rgba(236,72,153,0.16), transparent 55%)";

export default function Home() {
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return getSupabaseBrowserClient();
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("sign-in");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthError>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [refreshingSession, setRefreshingSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!supabase) return;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setProfileEmail(data.session?.user.email ?? null);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setProfileEmail(session?.user.email ?? null);
      },
    );

    initSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!supabase) {
      setError({
        message:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to continue.",
      });
    }
  }, [supabase]);

  const title = useMemo(
    () => (mode === "sign-in" ? "Welcome back" : "Create an account"),
    [mode],
  );

  const subtitle = useMemo(
    () =>
      mode === "sign-in"
        ? "Enter your Supabase credentials to sign in."
        : "Sign up with email and password to get started.",
    [mode],
  );

  const buttonLabel = useMemo(
    () => (mode === "sign-in" ? "Sign in" : "Create account"),
    [mode],
  );

  const toggleLabel = useMemo(
    () => (mode === "sign-in" ? "Need an account?" : "Already registered?"),
    [mode],
  );

  const toggleActionLabel = useMemo(
    () => (mode === "sign-in" ? "Sign up" : "Sign in"),
    [mode],
  );

  const handleAuth = async () => {
    if (!supabase) {
      setError({
        message:
          "Supabase client is unavailable. Verify your Supabase environment variables.",
      });
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "sign-in") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) {
          setError({ message: authError.message });
          return;
        }
        setMessage("You're signed in. Redirect or continue with your app flow.");
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) {
          setError({ message: authError.message });
          return;
        }
        setMessage(
          "Account created. Check your inbox to confirm your email, then sign in.",
        );
        setMode("sign-in");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) {
      setError({
        message:
          "Cannot sign out without a Supabase client. Check your configuration.",
      });
      return;
    }
    await supabase.auth.signOut();
    setMessage("Signed out.");
    setEmail("");
    setPassword("");
  };

  const refreshSession = async () => {
    if (!supabase) {
      setError({
        message:
          "Cannot refresh session without Supabase credentials. Check your configuration.",
      });
      return;
    }
    setRefreshingSession(true);
    setMessage(null);
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      setError({ message: refreshError.message });
    } else {
      setProfileEmail(data.session?.user.email ?? null);
      setMessage("Session refreshed.");
    }
    setRefreshingSession(false);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 px-6 py-12 font-sans text-slate-100"
      style={{ backgroundImage: heroGradient }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-start">
        <aside className="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="App logo"
              width={40}
              height={40}
              className="rounded-lg border border-white/20 bg-white/5 p-2"
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-slate-300">{subtitle}</p>
            </div>
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await handleAuth();
            }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                required
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </label>
            {error ? (
              <div className="rounded-lg border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error.message}
              </div>
            ) : null}
            {message ? (
              <div className="rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={submitting || !supabase}
              className="group flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-500/60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  {buttonLabel}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            <span>{toggleLabel}</span>
            <button
              type="button"
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              className="font-semibold text-blue-200 transition hover:text-white"
            >
              {toggleActionLabel}
            </button>
          </div>
        </aside>
        <section className="flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-[0_25px_80px_-40px_rgba(59,130,246,0.35)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Session overview
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshSession}
                disabled={refreshingSession || !supabase}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white/5"
              >
                {refreshingSession ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCcw className="h-3.5 w-3.5" />
                )}
                Refresh
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={!supabase}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white/5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/80 p-6">
            {profileEmail ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Logged in as
                </span>
                <span className="text-lg font-semibold text-white">
                  {profileEmail}
                </span>
                <p className="text-sm text-slate-300">
                  Replace this panel with the rest of your app once authentication
                  succeeds.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  No active session
                </span>
                <p className="text-sm text-slate-300">
                  After you sign in, your Supabase session will appear here.
                </p>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-emerald-500/10 p-6">
            <h3 className="text-base font-semibold text-white">
              Configure Supabase
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>
                1. Create a project at{" "}
                <a
                  href="https://supabase.com/dashboard/projects"
                  className="underline decoration-dashed underline-offset-4 hover:text-white"
                >
                  Supabase
                </a>
                .
              </li>
              <li>2. Enable email/password authentication.</li>
              <li>
                3. Add environment values to `.env.local` using your project URL
                and anon key.
              </li>
              <li>4. Restart the dev server before running locally.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
