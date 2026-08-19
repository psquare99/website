"use client";

import {
  FormEvent,
  useState,
} from "react";
import Link from "next/link";

import Container from "@/components/Container";

const STUDIO_API =
  process.env.NEXT_PUBLIC_STUDIO_API ??
  "http://localhost:3000";

export default function NotFound() {
  const [code, setCode] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [challengeId, setChallengeId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function requestOtp(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!code.trim()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          `${STUDIO_API}/api/auth/request-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              secret: code,
            }),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          challengeId?: string;
          error?: string;
        };

      if (!response.ok) {
        setMessage(
          data.error ??
            "The door remains locked.",
        );
        setCode("");
        return;
      }

      setChallengeId(
        data.challengeId ?? null,
      );

      setMessage(
        "The first key worked. Check your email for the second.",
      );
    } catch {
      setMessage(
        "The Workshop seems to be asleep. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !challengeId ||
      !otp.trim()
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          `${STUDIO_API}/api/auth/verify-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              challengeId,
              otp,
            }),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          handoffToken?: string;
          error?: string;
        };

      if (
        !response.ok ||
        !data.handoffToken
      ) {
        setMessage(
          data.error ??
            "That key doesn't seem to fit.",
        );
        setOtp("");
        return;
      }

      setMessage(
        "The door opens. Welcome to the Workshop.",
      );

      window.location.href =
        `${STUDIO_API}/api/auth/handoff?token=${encodeURIComponent(
          data.handoffToken,
        )}`;
    } catch {
      setMessage(
        "Something went wrong opening the door.",
      );
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    setChallengeId(null);
    setOtp("");
    setCode("");
    setMessage("");
  }

  return (
    <Container>
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-neutral-900">
          Well, you found it.
        </h1>

        <p className="mt-8 text-xl leading-9 text-neutral-600">
          This is the Workshop.
        </p>

        <div className="mt-10 space-y-5 text-lg leading-9 text-neutral-700">
          <p>
            It's just... not finished yet.
          </p>

          <p>
            Please don't touch anything.
            <br />
            There's probably a server running somewhere.
          </p>

          <p className="italic">
            But the door appears to be locked.
          </p>
        </div>

        {!challengeId ? (
          <form
            onSubmit={requestOtp}
            className="mt-12 w-full max-w-sm"
          >
            <label
              htmlFor="workshop-code"
              className="mb-3 block text-sm font-medium uppercase tracking-widest text-neutral-500"
            >
              Enter the secret code
            </label>

            <div className="flex gap-2">
              <input
                id="workshop-code"
                type="password"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                placeholder="••••••••••"
                autoComplete="off"
                autoFocus
                required
                className="
                  min-w-0
                  flex-1
                  rounded-full
                  border
                  border-neutral-300
                  bg-transparent
                  px-5
                  py-3
                  text-center
                  outline-none
                  transition-colors
                  focus:border-neutral-900
                "
              />

              <button
                type="submit"
                disabled={loading}
                className="
                  rounded-full
                  border
                  border-neutral-900
                  px-5
                  py-3
                  font-medium
                  transition-all
                  duration-200
                  hover:bg-neutral-900
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "..."
                  : "Enter"}
              </button>
            </div>

            {message && (
              <p
                className="mt-4 text-sm italic text-neutral-500"
                aria-live="polite"
              >
                {message}
              </p>
            )}
          </form>
        ) : (
          <form
            onSubmit={verifyOtp}
            className="mt-12 w-full max-w-sm"
          >
            <label
              htmlFor="workshop-otp"
              className="mb-3 block text-sm font-medium uppercase tracking-widest text-neutral-500"
            >
              The second key
            </label>

            <p className="mb-5 text-sm text-neutral-500">
              A verification code has been
              sent to your email.
            </p>

            <input
              id="workshop-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              autoFocus
              required
              placeholder="000000"
              className="
                w-full
                rounded-full
                border
                border-neutral-300
                bg-transparent
                px-5
                py-3
                text-center
                text-lg
                tracking-[0.4em]
                outline-none
                transition-colors
                focus:border-neutral-900
              "
            />

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
              className="
                mt-3
                w-full
                rounded-full
                border
                border-neutral-900
                px-5
                py-3
                font-medium
                transition-all
                duration-200
                hover:bg-neutral-900
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Opening..."
                : "Open Workshop"}
            </button>

            {message && (
              <p
                className="mt-4 text-sm italic text-neutral-500"
                aria-live="polite"
              >
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={startOver}
              className="mt-5 text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-700"
            >
              Start over
            </button>
          </form>
        )}

        <Link
          href="/"
          className="
            mt-12
            rounded-full
            border
            border-neutral-300
            px-6
            py-3
            font-medium
            transition-all
            duration-200
            hover:border-neutral-900
            hover:bg-neutral-900
            hover:text-white
          "
        >
          ← Pretend you never saw this
        </Link>
      </main>
    </Container>
  );
}