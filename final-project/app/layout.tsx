
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import ConditionalFooter from "@/components/ConditionalFooter";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { headers } from "next/headers";
import Script from "next/script";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "CosFit",
  description: "AI Virtual Fitting for Cosplay",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();

  const role = headerList.get("x-user-role");

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body>
        {/* afterInteractive: snap.js baru dipakai saat user klik bayar. beforeInteractive
            di dalam <body> memicu warning "Encountered a script tag" di React 19. */}
        <Script
          src={
            process.env.MIDTRANS_IS_PRODUCTION === "true"
              ? "https://app.midtrans.com/snap/snap.js"
              : "https://app.sandbox.midtrans.com/snap/snap.js"
          }
          data-client-key={process.env.MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <ConditionalNavbar role={role}>
          {children}
        </ConditionalNavbar>
      </body>
    </html>
  );
}


