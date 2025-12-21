"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithEmail } from "@/lib/supabase/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    searchParams.get("error") ? { type: "error", text: "Authentication failed. Please try again." } : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await signInWithEmail(email);

      if (result.error) {
        setMessage({
          type: "error",
          text: result.error,
        });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for a sign-in link!",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="mb-8 flex justify-center lg:hidden">
        <Image
          src="/jackson_logo.png"
          alt="Jackson Rental Homes"
          width={180}
          height={72}
          className="h-14 w-auto"
          priority
        />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-jackson-charcoal">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-jackson-text-muted">
          Enter your email to receive a sign-in link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-jackson-charcoal"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-2 block w-full rounded-xl border border-jackson-cream-dark bg-jackson-white px-4 py-3 text-jackson-charcoal placeholder-jackson-text-muted shadow-sm transition focus:border-jackson-green focus:outline-none focus:ring-2 focus:ring-jackson-green/20"
          />
        </div>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${message.type === "success"
              ? "bg-jackson-green/10 text-jackson-green"
              : "bg-red-50 text-red-600"
              }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-jackson-green px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-jackson-green-dark focus:outline-none focus:ring-2 focus:ring-jackson-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Sending link...
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send sign-in link
            </>
          )}
        </button>
      </form>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-jackson-cream">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-jackson-charcoal p-12 lg:flex">
        <div />
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Jackson Rental Homes Dashboard
          </h1>
          <p className="text-lg text-jackson-cream-dark">
            Monitor leasing calls and resident support handled by your AI receptionist. 
            Get insights, track performance, and optimize your property management workflow.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 rounded-full bg-jackson-green/20 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-jackson-green" />
              <span className="text-sm font-medium text-jackson-green">AI-Powered Analytics</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-jackson-cream/10 px-4 py-2">
              <span className="text-sm font-medium text-jackson-cream-dark">Real-time Data</span>
            </div>
          </div>
        </div>

        <div />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-8 lg:w-1/2 lg:px-16">
        <Suspense fallback={<div className="text-jackson-text-muted">Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
