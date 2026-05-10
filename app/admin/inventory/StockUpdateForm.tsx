"use client";

import { useActionState, useRef } from "react";
import { updateStockAction } from "@/app/actions/admin";

interface Props {
  variantId: string;
  currentStock: number;
}

export function StockUpdateForm({ variantId, currentStock }: Props) {
  const [state, action, isPending] = useActionState(updateStockAction, null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={action}
      className="flex items-center justify-end gap-2"
      onSubmit={() => {
        if (inputRef.current) inputRef.current.value = String(currentStock);
      }}
    >
      <input type="hidden" name="variantId" value={variantId} />
      <input
        ref={inputRef}
        name="quantity"
        type="number"
        min="0"
        defaultValue={currentStock}
        className="w-16 border border-border bg-transparent px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-foreground"
        aria-label="Stock quantity"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isPending ? "..." : "Set"}
      </button>
      {state?.error && (
        <span className="text-xs text-red-600 ml-1">{state.error}</span>
      )}
    </form>
  );
}
