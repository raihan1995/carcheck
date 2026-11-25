"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export function ReloadButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="button button-secondary"
      disabled={pending}
      onClick={() => start(() => router.refresh())}
    >
      {pending ? "Retrying…" : "Try again"}
    </button>
  );
}
