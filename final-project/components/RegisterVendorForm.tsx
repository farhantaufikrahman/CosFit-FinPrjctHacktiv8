'use client'

import errorHandler from "@/app/helpers/errorHandler";
import { ArrowRight, Building2, Eye, Globe, Lock, Mail, MapPin, Phone,  } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";

export default function RegisterVendorForm()
{
    const [namaToko, setNamaToko] = useState("")
    const [alamat, setAlamat] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmedPass, setConfirmedPass] = useState("")
    const [no_phone, setNoPhone] = useState("")
    const [webUrl, setWebUrl] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if(password !== confirmedPass)
            {
                throw new Error("Password isnt match")
            }

            await fetch(`/api/vendor/register`, {
                method: "POST",
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({namaToko, alamat, email, password, no_phone, webUrl})
            })

            router.push("/vendor/login")
            
        } catch (error) {
           errorHandler(error) 
        }
    }

    return(
        <form className="mt-12 space-y-7" onSubmit={handleSubmit}>

              <div className="grid md:grid-cols-2 gap-6">

                <Input
                  label="Business Name"
                  icon={<Building2 />}
                  placeholder="Enter your business name"
                  value={namaToko}
                  onChange={(e) => {setNamaToko(e.target.value)}}
                />

                <Input
                  label="Business Address"
                  icon={<MapPin />}
                  placeholder="Enter address"
                  value={alamat}
                  onChange={(e) => {setAlamat(e.target.value)}}
                />

                <Input
                  label="Business Email"
                  icon={<Mail />}
                  placeholder="you@yourbusiness.com"
                  value={email}
                  onChange={(e) => {setEmail(e.target.value)}}
                />

                <Input
                  label="Phone Number"
                  icon={<Phone />}
                  placeholder="+62 812 3456 7890"
                  value={no_phone}
                  onChange={(e) => {setNoPhone(e.target.value)}}
                />

              </div>

              <Input
                label="Website / Instagram"
                icon={<Globe />}
                placeholder="https://instagram.com/yourbusiness"
                value={webUrl}
                onChange={(e) => {setWebUrl(e.target.value)}}
              />

              <div className="grid md:grid-cols-2 gap-6">

                <PasswordInput
                  label="Password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {setPassword(e.target.value)}}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmedPass}
                  onChange={(e) => {setConfirmedPass(e.target.value)}}
                />

              </div>

              <label className="flex items-center gap-3">

                <input type="checkbox" />

                <span className="text-gray-600">
                  I agree to the CosFit
                  <span className="text-primary">
                    {" "}Vendor Terms of Service
                  </span>
                  {" "}and{" "}
                  <span className="text-primary">
                    Privacy Policy
                  </span>
                </span>

              </label>

              <button className="w-full h-16 bg-(--primary) rounded-xl text-white font-semibold text-xl flex justify-center items-center gap-3" type="submit">
                Create Vendor Account
                <ArrowRight />
              </button>

              {/* <div className="flex items-center gap-4">

                <div className="flex-1 h-px bg-gray-200" />

                <span className="text-gray-400">
                  or continue with
                </span>

                <div className="flex-1 h-px bg-gray-200" />

              </div>

              <button
                type="button"
                className="w-full h-16 rounded-xl border text-lg"
              >
                Continue with Google
              </button> */}

              <p className="text-center text-gray-600">

                Already have a Vendor Account?

                <Link href={"/vendor/login"} >
                  <button
                    type="button"
                    className="ml-2 text-primary font-semibold inline-flex items-center gap-2"
                  >
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

              </p>

        </form>
    )
}

function Input({
  label,
  placeholder,
  icon,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block mb-3 font-medium">
        {label}
      </label>

      <div className="h-14 border rounded-xl px-4 flex items-center gap-3">
        {icon}
        <input
          className="flex-1 outline-none"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block mb-3 font-medium">
        {label}
      </label>

      <div className="h-14 border rounded-xl px-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-gray-400" />

        <input
          type="password"
          className="flex-1 outline-none"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />

        <Eye className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}