import { cookies } from "next/headers";
import CheckoutExperience from "../../components/checkout/CheckoutExperience";
import { GetCheckout, GetProduct } from "../types";

export default async function CheckoutPage() {
  async function getCheckout() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/checkout`, {
      cache: "no-store",
      headers: {
        Cookie: `Authorization=${auth?.value}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch checkout");
    }

    return res.json() as Promise<GetCheckout[]>;
  }

  const checkout = await getCheckout();
  const vendor = checkout?.[0]?.vendor;

  const groupedProducts = Object.values(
    checkout.reduce(
      (acc, item) => {
        const id = item.product._id;

        if (!acc[id]) {
          acc[id] = {
            product: item.product,
            quantity: 0,
          };
        }

        // Checkout sekarang menyimpan `quantity` per product (upsert); data lama
        // tanpa field quantity tetap dihitung 1 per dokumen.
        acc[id].quantity += Number(item.quantity) || 1;

        return acc;
      },
      {} as Record<
        string,
        {
          product: GetProduct;
          quantity: number;
        }
      >,
    ),
  );

  return (
    <CheckoutExperience groupedProducts={groupedProducts} vendor={vendor} />
  );
}
