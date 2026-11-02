import VendorModel from "@/db/models/vendorModel";
import errorHandler from "@/app/helpers/errorHandler";
import { compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email || !body.password) {
      throw { message: "Email and password are required", status: 400 };
    }

    const vendor = await VendorModel.findByEmail(body.email);

    if (!vendor) {
      throw { message: "Invalid email or password", status: 401 };
    }

    const isPasswordMatch = compareSync(body.password, vendor.password);

    if (!isPasswordMatch) {
      throw { message: "Invalid email or password", status: 401 };
    }
    const token = sign(
      { id: vendor._id, email: vendor.email, role: "Vendor" },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }, // sebelumnya token tidak pernah kadaluarsa
    );

    const cookieStore = await cookies();
    // httpOnly: tidak bisa dibaca JS (mitigasi pencurian token via XSS)
    cookieStore.set({
      name: "Authorization",
      value: `Bearer ${token}`,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set({
      name: "x-user-role",
      value: "Vendor",
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json(
      { message: "Login successful", token },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
