import UserModel from "@/db/models/userModel";
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

    const user = await UserModel.findByEmail(body.email);

    if (!user) {
      throw { message: "Invalid email or password", status: 401 };
    }

    const isPasswordMatch = compareSync(body.password, user.password);

    if (!isPasswordMatch) {
      throw { message: "Invalid email or password", status: 401 };
    }

    const normalizedRole =
      typeof user.role === "string" && user.role.toLowerCase() === "admin"
        ? "Admin"
        : "User";

    const token = sign(
      { id: user._id, email: user.email, role: normalizedRole },
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
      value: normalizedRole,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json(
      { message: "Login successful", token, role: normalizedRole },
      { status: 200 },
    );
  } catch (error) {
    return errorHandler(error);
  }
}
