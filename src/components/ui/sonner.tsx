import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      toastOptions={{
        className:
          "font-sans border border-border bg-surface text-ink shadow-none",
      }}
    />
  );
}
