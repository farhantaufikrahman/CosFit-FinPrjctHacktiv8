// Snap.js Midtrans dimuat lewat <Script> di app/layout.tsx dan menempel di window.
// Docs: https://docs.midtrans.com/docs/snap-snap-integration-guide
export {};

type SnapResult = Record<string, unknown>;

declare global {
  interface Window {
    snap: {
      pay(
        token: string,
        options?: {
          onSuccess?: (result: SnapResult) => void | Promise<void>;
          onPending?: (result: SnapResult) => void | Promise<void>;
          onError?: (result: SnapResult) => void | Promise<void>;
          onClose?: () => void;
        },
      ): void;
    };
  }
}
