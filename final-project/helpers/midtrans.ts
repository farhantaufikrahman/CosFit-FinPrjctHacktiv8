import midtransClient from "midtrans-client";
export interface SnapItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface SnapTransactionParams {
  transaction_details: { order_id: string; gross_amount: number };
  item_details?: SnapItem[];
  customer_details?: { first_name?: string; email?: string; phone?: string };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

interface SnapTransactionStatus {
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
}

interface SnapClient {
  createTransaction(
    params: SnapTransactionParams,
  ): Promise<{ token: string; redirect_url: string }>;
  transaction: { status(orderId: string): Promise<SnapTransactionStatus> };
}

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
}) as unknown as SnapClient;

export async function getVerifiedPayment(orderId: string) {
  let status: SnapTransactionStatus;
  try {
    status = await snap.transaction.status(orderId);
  } catch (err) {
    const e = err as { httpStatusCode?: number | string };
    if (String(e?.httpStatusCode) === "404") {
      return { paid: false, transactionStatus: "not_found", grossAmount: 0 };
    }
    throw err;
  }

  const paid =
    status.transaction_status === "settlement" ||
    (status.transaction_status === "capture" &&
      status.fraud_status === "accept");

  return {
    paid,
    transactionStatus: status.transaction_status,
    grossAmount: Number(status.gross_amount),
  };
}
