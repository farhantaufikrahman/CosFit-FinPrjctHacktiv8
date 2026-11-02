"use client";

import { useEffect, useRef } from "react";

// export default function ProductViewTracker({
//   productId,
// }: {
//   productId: string;
// }) {
//   const hasFetched = useRef(false);

//   useEffect(() => {
//     if (!hasFetched.current && productId) {
//       fetch(`/api/user/product/${productId}`, {
//         method: "PATCH",
//       }).catch((error) => console.error("Gagal menambah view:", error));

//       hasFetched.current = true;
//     }
//   }, [productId]);

//   return null;
// }

// uncomment untuk tidak spam views
export default function ProductViewTracker({
  productId,
}: {
  productId: string;
}) {
  const hasFetched = useRef(false);
  const MAX_VIEWS = 3; // Batas view per sesi

  useEffect(() => {
    if (!productId || hasFetched.current) return;

    const viewedItems = JSON.parse(
      sessionStorage.getItem("viewedProducts") || "{}",
    );
    const currentCount = viewedItems[productId] || 0;

    if (currentCount < MAX_VIEWS) {
      viewedItems[productId] = currentCount + 1;
      sessionStorage.setItem("viewedProducts", JSON.stringify(viewedItems));

      hasFetched.current = true;
      fetch(`/api/user/product/${productId}`, { method: "PATCH" }).catch(
        (err) => console.error("Gagal menambah view:", err),
      );
    }
  }, [productId]);

  return null;
}
