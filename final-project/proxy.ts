import { cookies } from "next/headers";
import { verify, JsonWebTokenError } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import errorHandler from "./app/helpers/errorHandler";
import ProductModel from "./db/models/productModel";

type TokenPayload = {
  id: string;
  email: string;
  role: "User" | "Vendor" | "Admin";
};

// Header internal yang HANYA boleh di-set oleh proxy ini.
// Kalau tidak dihapus, client bisa mengirim `x-user-id: <id orang lain>` sendiri.
const INTERNAL_HEADERS = ["x-user-id", "x-user-email", "x-user-role"];

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/vendor/login",
  "/vendor/register",
  "/api/user/register",
  "/api/user/login",
  "/api/vendor/register",
  "/api/vendor/login",
]);

function isLoginRequired(pathname: string, method: string) {
  return (
    pathname === "/profile" ||
    pathname === "/credits" ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/vendor") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/user/profile" ||
    pathname === "/api/user/token" ||
    pathname.startsWith("/api/user/wishlist") ||
    pathname.startsWith("/api/user/checkout") ||
    pathname === "/api/user/try-on" ||
    pathname === "/api/user/history" ||
    pathname === "/api/pay" ||
    pathname === "/api/topup" ||
    // GET userDesign boleh publik (lihat entries), selain itu wajib login
    (pathname.startsWith("/api/userDesign") && method !== "GET") ||
    // Membaca forum & chat publik, menulis wajib login
    (pathname.startsWith("/api/forum") && method !== "GET") ||
    (pathname.startsWith("/api/chat") && method !== "GET") ||
    (pathname === "/api/event" && method !== "GET")
  );
}

function isAdminOnly(pathname: string, method: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    (pathname === "/api/event" && method !== "GET")
  );
}

function isVendorOnly(pathname: string) {
  return pathname.startsWith("/vendor") || pathname.startsWith("/api/vendor");
}

export async function proxy(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const method = request.method.toUpperCase();

    const requestHeaders = new Headers(request.headers);
    INTERNAL_HEADERS.forEach((h) => requestHeaders.delete(h));
    requestHeaders.set("x-pathname", pathname);

    const cookieStore = await cookies();
    const authToken = cookieStore.get("Authorization");

    let decoded: TokenPayload | undefined;
    let hasInvalidToken = false;

    if (authToken) {
      const [type, token] = authToken.value.split(" ");
      if (type === "Bearer" && token) {
        try {
          decoded = verify(token, process.env.JWT_SECRET as string) as TokenPayload;
          requestHeaders.set("x-user-email", decoded.email);
          requestHeaders.set("x-user-id", decoded.id);
          requestHeaders.set("x-user-role", decoded.role);
        } catch (err) {
          // Token kadaluarsa / JWT_SECRET berganti: perlakukan sebagai belum login,
          // jangan bikin seluruh website 500.
          if (!(err instanceof JsonWebTokenError)) throw err;
          hasInvalidToken = true;
        }
      } else {
        hasInvalidToken = true;
      }
    }

    const next = () => {
      const res = NextResponse.next({ request: { headers: requestHeaders } });
      if (hasInvalidToken) {
        res.cookies.delete("Authorization");
        res.cookies.delete("x-user-role");
      }
      return res;
    };

    // API -> JSON error, halaman -> redirect ke halaman login yang sesuai
    const deny = (status: 401 | 403) => {
      if (pathname.startsWith("/api")) {
        throw { message: status === 401 ? "please login first" : "Forbidden", status };
      }
      const loginPath = isVendorOnly(pathname) ? "/vendor/login" : "/login";
      return NextResponse.redirect(new URL(loginPath, request.url));
    };

    if (PUBLIC_EXACT.has(pathname)) return next();

    if (isLoginRequired(pathname, method) && !decoded) return deny(401);

    if (decoded && isAdminOnly(pathname, method) && decoded.role !== "Admin") {
      return deny(403);
    }

    if (decoded && isVendorOnly(pathname) && decoded.role !== "Vendor") {
      return deny(403);
    }

    // Ownership check: /api/vendor/product/:id(/...)
    if (decoded && pathname.startsWith("/api/vendor/product/")) {
      const id = pathname.split("/")[4];

      if (!ObjectId.isValid(id)) {
        throw { message: "Product not found", status: 404 };
      }

      const product = await ProductModel.getById(id);
      if (product.vendorId.toString() !== decoded.id) {
        throw { message: "Forbidden", status: 403 };
      }
    }

    return next();
  } catch (err) {
    return errorHandler(err);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
