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
