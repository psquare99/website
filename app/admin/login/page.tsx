"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "secret" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("secret");
  const [secret, setSecret] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSecretSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        challengeId?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Authentication failed.");
        return;
      }

      setChallengeId(data.challengeId ?? "");
      setStep("otp");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, otp }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Verification failed.");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">
          Admin Login
        </h1>

        {step === "secret" && (
          <form onSubmit={handleSecretSubmit}>
            <label className="mb-2 block text-sm text-gray-500">
              Secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-500"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <p className="mb-4 text-sm text-gray-500">
              Check your email for the verification code.
            </p>
            <label className="mb-2 block text-sm text-gray-500">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-gray-500"
              autoFocus
              required
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Log In"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
