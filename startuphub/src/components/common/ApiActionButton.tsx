"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { apiFetch } from "@/lib/client-api";

type Props = {
  url: string;
  method?: "POST" | "DELETE";
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Если задано — первое нажатие только просит подтверждения (без браузерного confirm()). */
  confirmLabel?: string;
  /** Куда перейти после успеха; по умолчанию страница просто обновляется. */
  redirectTo?: string;
};

/** Кнопка, которая вызывает наш API и обновляет данные страницы. */
export function ApiActionButton({ url, method = "POST", label, variant = "secondary", confirmLabel, redirectTo }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (confirmLabel && !confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiFetch(url, { method });
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant={confirming ? "danger" : variant}
        loading={loading}
        onClick={run}
        onBlur={() => setConfirming(false)}
      >
        {confirming ? confirmLabel : label}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
