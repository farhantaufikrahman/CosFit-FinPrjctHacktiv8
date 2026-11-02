'use client'

import errorHandler from "@/app/helpers/errorHandler";
import { User, Mail, Lock, Eye, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function RegisterForm() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if(confirmPass !== password)
      {
        throw new Error("Password doesnt match")
      }
      console.log({email, password, username})

      const data = await fetch(`/api/user/register`, {
        method: "POST",
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify({username, email, password})
      })

      setEmail("")
      setPassword("")
      setUsername("")
      setConfirmPass("")

      redirect("/login")

    } catch (error) {
      errorHandler(error)
    }
  }
  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--background)] p-10">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-12 shadow-xl">
        {/* Header */}

        <div className="mb-10">
          <h1 className="flex items-center gap-2 text-5xl font-bold text-[var(--text)]">
            Create Your Account
            <Sparkles size={28} className="text-[var(--accent)]" />
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            Join thousands of cosplayers in the CosFit community.
          </p>
        </div>
        
        <form action="" onSubmit={handleSubmit}>
          {/* Username */}

          <div className="mb-6">
            <label className="mb-2 block font-medium text-[var(--text)]">
              Username
            </label>

            <div className="flex h-14 items-center rounded-2xl border border-[var(--border)] px-4">
              <User size={20} className="text-gray-400" />

              <input
                type="text"
                placeholder="Enter your username"
                className="ml-3 w-full bg-transparent outline-none placeholder:text-gray-400"
                onChange={(e) => {setUsername(e.target.value)}}
                value={username}
              />
            </div>
          </div>

          {/* Email */}

          <div className="mb-6">
            <label className="mb-2 block font-medium text-[var(--text)]">
              Email
            </label>

            <div className="flex h-14 items-center rounded-2xl border border-[var(--border)] px-4">
              <Mail size={20} className="text-gray-400" />

              <input
                type="email"
                placeholder="Enter your email"
                className="ml-3 w-full bg-transparent outline-none placeholder:text-gray-400"
                onChange={(e) => {setEmail(e.target.value)}}
                value={email}
              />
            </div>
          </div>

          {/* Password */}

          <div className="mb-6">
            <label className="mb-2 block font-medium text-[var(--text)]">
              Password
            </label>

            <div className="flex h-14 items-center rounded-2xl border border-[var(--border)] px-4">
              <Lock size={20} className="text-gray-400" />

              <input
                type="password"
                placeholder="Create a password"
                className="ml-3 w-full bg-transparent outline-none placeholder:text-gray-400"
                onChange={(e) => {setPassword(e.target.value)}}
                value={password}
              />

              <Eye size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Confirm Password */}

          <div className="mb-8">
            <label className="mb-2 block font-medium text-[var(--text)]">
              Confirm Password
            </label>

            <div className="flex h-14 items-center rounded-2xl border border-[var(--border)] px-4">
              <Lock size={20} className="text-gray-400" />

              <input
                type="password"
                placeholder="Confirm your password"
                className="ml-3 w-full bg-transparent outline-none placeholder:text-gray-400"
                onChange={(e) => {setConfirmPass(e.target.value)}}
                value={confirmPass}
              />

              <Eye size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Terms */}

          <div className="mb-8 flex items-start gap-3">
            <input type="checkbox" className="mt-1 accent-[var(--primary)]" />

            <p className="text-sm text-gray-500">
              I agree to the
              <span className="mx-1 text-[var(--primary)]">Terms of Service</span>
              and
              <span className="ml-1 text-[var(--primary)]">Privacy Policy</span>
            </p>
          </div>

          {/* Button */}

          <button className="mb-8 h-14 w-full rounded-2xl bg-[var(--primary)] text-lg font-semibold text-white transition hover:opacity-90" type="submit">
            Register Now ✨
          </button>
        </form>
      </div>
    </section>
  );
}
