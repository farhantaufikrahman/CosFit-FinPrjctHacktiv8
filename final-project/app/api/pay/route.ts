import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import ProductModel from "@/db/models/productModel";
import OrderModel from "@/db/models/orderModel";
import CheckoutModel from "@/db/models/checkoutModel";
import { snap, getVerifiedPayment } from "@/helpers/midtrans";
import errorHandler from "@/app/helpers/errorHandler";

type CartItem = { product: { _id: string }; quantity: number | string };

async function getOwnedOrder(orderId: unknown, userId: string) {
  if (typeof orderId !== "string" || !orderId) {
    throw { message: "orderId is required", status: 400 };
  }
  const order = await OrderModel.getByOrderId(orderId);
  if (!order || order.userId?.toString() !== userId) {
    throw { message: "Order not found", status: 404 };
  }
  return order;
}

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const res = await OrderModel.getByUserId(userId);
    return NextResponse.json(res);
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const email = req.headers.get("x-user-email") ?? undefined;
    const body = await req.json();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw { message: "items is required", status: 400 };
    }

    const items = [];
    let grossAmount = 0;

    for (const cartItem of body.items as CartItem[]) {
      const quantity = Number(cartItem.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw { message: "Invalid quantity", status: 400 };
      }

      const product = await ProductModel.getById(cartItem.product?._id);

      if (Number(product.stock) < quantity) {
        throw { message: `${product.title} is out of stock`, status: 400 };
      }

      // Midtrans mewajibkan price integer & sum(price*qty) === gross_amount
      const price = Math.round(Number(product.finalPrice || product.originalPrice));
      if (!Number.isFinite(price) || price <= 0) {
        throw { message: `${product.title} has invalid price`, status: 400 };
      }

      grossAmount += price * quantity;
      items.push({
        productId: product._id,
        price,
        quantity,
        name: String(product.title).slice(0, 50), // batas nama item Midtrans: 50 char
      });
    }

    const orderId = crypto.randomUUID();

    await OrderModel.create({
      orderId,
      items,
      total: grossAmount,
      paymentStatus: "Pending",
      userId: new ObjectId(userId),
    });

    const transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      item_details: items.map((i) => ({
        id: i.productId.toString(),
        price: i.price,
        quantity: i.quantity,
        name: i.name,
      })),
      customer_details: { email },
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
    const order = await getOwnedOrder(body.orderId, userId);

    if (body.status === "Pending") {
      if (order.paymentStatus === "Success") {
        return NextResponse.json({ message: "Order already paid" });
      }
      await OrderModel.updateStatus(order.orderId, "Pending");
      return NextResponse.json({ message: "Order is pending" });
    }

    if (body.status !== "Success") {
      throw { message: "Invalid status", status: 400 };
    }

    // Verifikasi server-to-server — bukan percaya body dari client
    const payment = await getVerifiedPayment(order.orderId);
    if (!payment.paid || payment.grossAmount !== Number(order.total)) {
      throw { message: `Payment not verified (${payment.transactionStatus})`, status: 402 };
    }

    // Atomic Pending -> Success: request kedua (double click / retry) tidak
    // akan mengurangi stok dua kali.
    const transitioned = await OrderModel.markPaid(order.orderId);
    if (!transitioned) {
      return NextResponse.json({ message: "Order already processed" });
    }

    await Promise.all(
      order.items.map((item: { productId: ObjectId; quantity: number }) =>
        Promise.all([
          ProductModel.decreaseQuantity(item.productId.toString(), item.quantity),
          CheckoutModel.deleteCheckoutByProductAndUserId(userId, item.productId.toString()),
        ]),
      ),
    );

    return NextResponse.json({ message: "Payment success" });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") as string;
    const body = await req.json();
    // Frontend mengirim `orderId`, route lama membaca `order_id` -> tidak pernah terhapus
    const order = await getOwnedOrder(body.orderId ?? body.order_id, userId);

    if (order.paymentStatus === "Success") {
      throw { message: "Paid order cannot be deleted", status: 400 };
    }

    const res = await OrderModel.delete(order.orderId);
    return NextResponse.json(res);
  } catch (error) {
    return errorHandler(error);
  }
}
