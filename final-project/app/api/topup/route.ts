import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import errorHandler from "@/app/helpers/errorHandler";
import UserModel from "@/db/models/userModel";
import { database } from "@/db/config/mongodb";
import { snap, getVerifiedPayment } from "@/helpers/midtrans";

// Harga ditentukan server — jangan pernah percaya harga/credit dari client
const PACKAGES: Record<number, number> = {
  20: 29000,
  60: 79000,
  150: 179000,
};

const topups = () => database.collection("topups");

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const body = await req.json();

    const credits = Number(body.credits);
    const price = PACKAGES[credits];
    if (!price) {
      throw { message: "Invalid package", status: 400 };
    }

    const orderId = `TOPUP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    await topups().insertOne({
      orderId,
      userId: new ObjectId(userId),
      credits,
      price,
      status: "Pending",
      createdAt: new Date(),
    });

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: price },
      item_details: [{ id: `credit-${credits}`, price, quantity: 1, name: `${credits} Credits` }],
      custom_field1: userId,
      custom_field2: String(credits),
    });

    return NextResponse.json({ token: transaction.token, orderId });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const body = await req.json();

    if (typeof body.orderId !== "string") {
      throw { message: "orderId is required", status: 400 };
    }

    const topup = await topups().findOne({
      orderId: body.orderId,
      userId: new ObjectId(userId),
    });
    if (!topup) throw { message: "Top up not found", status: 404 };
    if (topup.status === "Success") {
      return NextResponse.json({ message: "Top up already processed" });
    }

    const payment = await getVerifiedPayment(topup.orderId);
    if (!payment.paid || payment.grossAmount !== topup.price) {
      throw { message: `Payment not verified (${payment.transactionStatus})`, status: 402 };
    }

    // Atomic: credit hanya ditambahkan satu kali per orderId
    const res = await topups().updateOne(
      { _id: topup._id, status: { $ne: "Success" } },
      { $set: { status: "Success", paidAt: new Date() } },
    );
    if (res.modifiedCount !== 1) {
      return NextResponse.json({ message: "Top up already processed" });
    }

    await UserModel.topUpToken(userId, topup.credits);
    return NextResponse.json({ message: `Success add ${topup.credits} credits` });
  } catch (error) {
    return errorHandler(error);
  }
}
