"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Sparkles, ArrowLeft } from "lucide-react";

type Step = "secret" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("secret");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
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
        setError(data.error ?? "Nice try. The chimney smoke says otherwise.");
        return;
      }

      setChallengeId(data.challengeId ?? "");
      setStep("otp");
    } catch {
      setError("Something went wrong opening the door.");
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
        setError(data.error ?? "That key doesn't seem to fit.");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Something went wrong unlocking the Workshop.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToSecret() {
    setStep("secret");
    setChallengeId("");
    setOtp("");
    setError("");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#181411] px-4 py-12 text-[#f3ece2] selection:bg-[#5e7c5a] selection:text-white sm:px-6 lg:px-8">
      {/* Warm ambient lighting in background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3a281c]/70 via-[#1a1411]/90 to-[#0f0c0a]"
        aria-hidden="true"
      />

      {/* Subtle wood-grain / workbench vignette */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#f4a261]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
        {/* Header: Secret branding */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4a392d] bg-[#2a1e16] shadow-md shadow-black/40">
            <Image
              unoptimized
              src="/images/home/workshop-cabin-navbar.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />
          </div>

          <p
            className="text-2xl font-bold tracking-wide text-[#e8b57f] sm:text-3xl"
            style={{ fontFamily: "var(--font-script)" }}
          >
            Psst...
          </p>

          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#fbf7f0] sm:text-4xl">
            This is the Workshop.
          </h1>

          <p className="mt-2 font-serif text-sm italic text-[#b8a291] sm:text-base">
            Only if you know the way in.
          </p>
        </header>

        {/* Composition Grid: Side Notes (Desktop) + Central Parchment */}
        <div className="relative flex w-full max-w-4xl items-center justify-center gap-8 lg:justify-between">
          {/* Left Pinned Note (Desktop only) */}
          <aside
            aria-label="Workshop principles"
            className="hidden w-56 -rotate-2 rounded-xl border border-[#d6c9b5] bg-[#fbf6ec] p-5 text-neutral-800 shadow-xl shadow-black/40 transition-transform duration-300 hover:rotate-0 lg:block"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="h-3 w-3 rounded-full bg-[#5e7c5a] shadow-inner" />
              <Sparkles className="h-3.5 w-3.5 text-[#a48c78]" />
            </div>
            <p
              className="mb-2 text-lg font-bold text-neutral-900"
              style={{ fontFamily: "var(--font-script)" }}
            >
              Remember:
            </p>
            <ul className="space-y-1.5 font-serif text-xs leading-relaxed text-neutral-700">
              <li>• Stay curious</li>
              <li>• Keep building</li>
              <li>• Don&apos;t overthink</li>
              <li>• Ship things</li>
            </ul>
          </aside>

          {/* Central Parchment / Pinned Paper */}
          <main className="relative w-full max-w-md rounded-2xl border-2 border-[#d6c9b5] bg-[#fbf8f2] p-7 text-neutral-900 shadow-2xl shadow-black/60 sm:p-9">
            {/* Top Pushpin Accent */}
            <div
              className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center justify-center"
              aria-hidden="true"
            >
              <span className="h-6 w-6 rounded-full border-2 border-[#3d271d] bg-[#5e7c5a] shadow-md" />
            </div>

            {step === "secret" && (
              <form onSubmit={handleSecretSubmit} className="space-y-6">
                <div className="text-center">
                  <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#5e7c5a]">
                    ENTRY CODE
                  </span>
                  <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    Enter the secret code
                  </h2>
                  <p className="mt-1.5 font-serif text-sm italic text-neutral-600">
                    The right code will open the door.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="workshop-secret"
                    className="block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600"
                  >
                    Secret Code
                  </label>
                  <div className="relative">
                    <input
                      id="workshop-secret"
                      type={showSecret ? "text" : "password"}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="••••••••••"
                      autoFocus
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-neutral-300 bg-[#f4efe6]/80 px-4 py-3 pr-12 font-serif text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#5e7c5a] focus:ring-2 focus:ring-[#5e7c5a]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      aria-label={showSecret ? "Hide secret code" : "Show secret code"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#5e7c5a]"
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !secret.trim()}
                  className="w-full rounded-xl border border-[#2b2521] bg-[#221c18] py-3.5 font-sans text-sm font-semibold tracking-wide text-[#fbf8f2] shadow-md transition-all hover:bg-[#382f29] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Checking the smoke..." : "Continue"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="text-center">
                  <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#5e7c5a]">
                    VERIFICATION
                  </span>
                  <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    The second key
                  </h2>
                  <p className="mt-1.5 font-serif text-sm leading-relaxed text-neutral-600">
                    A 6-digit verification code has been dispatched to your email.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="workshop-otp"
                    className="block text-center font-sans text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600"
                  >
                    Verification Code
                  </label>
                  <input
                    id="workshop-otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    autoFocus
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="w-full rounded-xl border border-neutral-300 bg-[#f4efe6]/80 px-4 py-3.5 text-center font-mono text-xl tracking-[0.4em] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#5e7c5a] focus:ring-2 focus:ring-[#5e7c5a]/20"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full rounded-xl border border-[#2b2521] bg-[#221c18] py-3.5 font-sans text-sm font-semibold tracking-wide text-[#fbf8f2] shadow-md transition-all hover:bg-[#382f29] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Unlocking..." : "Open Workshop"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToSecret}
                    className="flex w-full items-center justify-center gap-1.5 py-1 text-center font-sans text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>Try a different code</span>
                  </button>
                </div>
              </form>
            )}

            {/* Error Message Callout */}
            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-center"
              >
                <p className="font-serif text-sm text-red-700">
                  {error}
                </p>
                {error.includes("chimney smoke") && (
                  <p
                    className="mt-1 text-base text-red-800"
                    style={{ fontFamily: "var(--font-script)" }}
                  >
                    Nice try. The chimney smoke says otherwise. ☺
                  </p>
                )}
              </div>
            )}
          </main>

          {/* Right Pinned Note (Desktop only) */}
          <aside
            aria-label="Workshop activities"
            className="hidden w-56 rotate-2 rounded-xl border border-[#d6c9b5] bg-[#fbf6ec] p-5 text-neutral-800 shadow-xl shadow-black/40 transition-transform duration-300 hover:rotate-0 lg:block"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="h-3 w-3 rounded-full bg-[#5e7c5a] shadow-inner" />
              <KeyRound className="h-3.5 w-3.5 text-[#a48c78]" />
            </div>
            <p
              className="mb-2 text-lg font-bold text-neutral-900"
              style={{ fontFamily: "var(--font-script)" }}
            >
              What&apos;s inside?
            </p>
            <ul className="space-y-1.5 font-serif text-xs leading-relaxed text-neutral-700">
              <li>✎ Write</li>
              <li>↑ Upload</li>
              <li>□ Publish</li>
              <li>◇ See it live</li>
            </ul>
          </aside>
        </div>

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-serif text-sm text-[#b8a291] transition-colors hover:text-[#f3ece2]"
          >
            <span>← Pretend you never saw this</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
