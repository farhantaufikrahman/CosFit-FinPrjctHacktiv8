import midtransClient from "midtrans-client";

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

/**
 * Jangan pernah percaya callback `onSuccess` dari browser — siapa pun bisa
 * memanggil endpoint PATCH secara manual. Status pembayaran harus dicek
 * server-to-server ke Midtrans.
 * Docs: https://docs.midtrans.com/reference/get-transaction-status
 */
export async function getVerifiedPayment(orderId: string) {
  // midtrans-client: snap.transaction.status(orderId)
  // https://github.com/Midtrans/midtrans-nodejs-client#get-transaction-status
  let status: { transaction_status: string; fraud_status?: string; gross_amount: string };
  try {
    status = await snap.transaction.status(orderId);
  } catch (err) {
    // 404 = order belum pernah dibayar / tidak dikenal Midtrans
    const e = err as { httpStatusCode?: number | string };
    if (String(e?.httpStatusCode) === "404") {
      return { paid: false, transactionStatus: "not_found", grossAmount: 0 };
    }
    throw err;
  }

  const paid =
    status.transaction_status === "settlement" ||
    (status.transaction_status === "capture" && status.fraud_status === "accept");

  return {
    paid,
    transactionStatus: status.transaction_status as string,
    grossAmount: Number(status.gross_amount),
  };
}
