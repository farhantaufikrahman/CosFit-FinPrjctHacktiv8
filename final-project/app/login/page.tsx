"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  Sparkles,
  Users,
  ShieldCheck,
  WandSparkles,
  ArrowRight,
} from "lucide-react";
import { SubmitEvent, useState } from "react";
import errorHandler from "../helpers/errorHandler";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const route = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await fetch(`/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!data.ok) {
        const error = await data.json();
        throw new Error(error.message);
      }

      const result = await data.json().catch(() => ({}));
      const redirectPath = result.role === "Admin" ? "/admin" : "/";

      route.push(redirectPath);
      route.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong.");
      }

      errorHandler(error);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* ================= LEFT ================= */}

      <section className="relative hidden overflow-hidden bg-background lg:flex h-screen">
        {/* Character — full-bleed background photo */}

        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/images/register-girl.png"
            alt=""
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        {/* Scrim: keeps the left side (where the text sits) legible while the photo stays fully visible on the right */}

        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />

        {/* Glow */}

        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-[#E1BD9C]/30 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col p-12">
          {/* Logo */}

          <div>
            <h1 className="text-5xl font-bold text-primary">CosFit</h1>

            <p className="mt-2 text-lg text-secondary">AI Virtual Fitting</p>
          </div>

          {/* Heading */}

          <div className="mt-12 max-w-lg">
            <h2 className="text-6xl font-bold leading-tight text-text">
              See Yourself.
              <br />
              <span className="text-primary">Be Your Character.</span>
            </h2>

            <p className="mt-8 text-xl leading-9 text-gray-600">
              Continue your cosplay journey. Explore rentals, preview costumes
              with AI, and connect with the cosplay community.
            </p>
          </div>

          {/* Floating Card */}

          <div className="relative z-10 mt-auto w-[420px] max-w-full rounded-[30px] bg-white/80 p-8 shadow-xl backdrop-blur">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-background p-3">
                <Users className="text-primary" size={24} />
              </div>

              <div>
                <h3 className="font-semibold text-text">
                  Join 50,000+ Cosplayers
                </h3>

                <p className="text-sm text-gray-500">
                  Trusted by anime fans worldwide.
                </p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-background p-3">
                <WandSparkles className="text-primary" size={24} />
              </div>

              <div>
                <h3 className="font-semibold text-text">AI Virtual Try-On</h3>

                <p className="text-sm text-gray-500">
                  Preview costumes instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-background p-3">
                <ShieldCheck className="text-primary" size={24} />
              </div>

              <div>
                <h3 className="font-semibold text-text">
                  Verified Rental Vendors
                </h3>

                <p className="text-sm text-gray-500">
                  Safe and trusted cosplay rentals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RIGHT ================= */}

      <section className="flex items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-xl rounded-[36px] bg-white p-12 shadow-xl">
          <div className="mb-10">
            <h1 className="flex items-center gap-3 text-5xl font-bold text-text">
              Welcome Back
              <Sparkles className="text-accent" size={28} />
            </h1>

            <p className="mt-3 text-lg text-gray-500">
              Sign in to continue your cosplay journey.
            </p>
          </div>

          <form action="" onSubmit={handleSubmit}>
            {/* Email */}

            <div className="mb-6">
              <label className="mb-2 block font-medium">Email</label>

              <div className="flex h-14 items-center rounded-2xl border border-border px-4">
                <Mail size={20} className="text-gray-400" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="ml-3 w-full bg-transparent outline-none"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label className="mb-2 block font-medium">Password</label>

              <div className="flex h-14 items-center rounded-2xl border border-border px-4">
                <Lock size={20} className="text-gray-400" />

                <input
                  type="password"
                  placeholder="Enter password"
                  className="ml-3 w-full bg-transparent outline-none"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  value={password}
                />

                <Eye size={20} className="text-gray-400" />
              </div>

              {errorMessage && (
                <div className="mb-5 mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Remember & Forgot */}

            <div className="mt-5 mb-8 flex items-center justify-between">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm border-border checked:border-primary checked:bg-primary"
                />

                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                href="#"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}

            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:bg-secondary">
              Login
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Register */}

          <div className="mt-10 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?
              <Link
                href="/register"
                className="ml-2 font-semibold text-primary hover:underline"
              >
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
