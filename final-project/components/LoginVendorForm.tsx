'use client'

import errorHandler from "@/app/helpers/errorHandler";
import { ArrowRight, Eye, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function LoginVendorForm()
{
    const[email,setEmail] = useState("")
    const[password, setPassword] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await fetch(`/api/vendor/login`, {
                method: "POST",
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({email, password})
            })
            router.push("/vendor")
            router.refresh()
        } catch (error) {
            errorHandler(error)
        }
    }

    return(
        <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block mb-3 font-medium">
                  Business Email
                </label>

                <div className="flex items-center border rounded-xl px-5 h-16">
                  <Mail className="w-5 h-5 text-gray-400" />

                  <input
                    className="flex-1 outline-none ml-4"
                    placeholder="your-business@email.com"
                    value={email}
                    onChange={(e) => {setEmail(e.target.value)}}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-3 font-medium">
                  Password
                </label>

                <div className="flex items-center border rounded-xl px-5 h-16">
                  <Lock className="w-5 h-5 text-gray-400" />

                  <input
                    type="password"
                    className="flex-1 outline-none ml-4"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                  />

                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Remember */}
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-3">
                  <input type="checkbox" />
                  Remember Me
                </label>

                <button
                  type="button"
                  className="text-(--primary)"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login */}
              <button className="w-full h-16 rounded-xl bg-(--primary) text-white text-xl font-semibold flex justify-center items-center gap-3">
                Login to Dashboard
                <ArrowRight />
              </button>

              {/* Divider */}
              {/* <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div> */}

              {/* Google */}
              {/* <button
                type="button"
                className="w-full h-16 border rounded-xl text-lg"
              >
                Continue with Google
              </button> */}

              <div className="text-center pt-2">
                <p className="text-gray-500">
                    Don&apos;t have a vendor account?
                </p>

                <Link href={"/vendor/register"}>
                    <button
                    type="button"
                    className="text-(--primary) font-semibold mt-2 inline-flex items-center gap-2"
                    >
                    Register as Vendor
                    <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
              </div>
            </form>
    )
}