"use client";

import { useActionState } from "react";
import { updateOrderStatusAction } from "@/app/actions/admin";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

interface Props {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber: string;
  currentTrackingUrl: string;
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentTrackingUrl,
}: Props) {
  const [state, action, isPending] = useActionState(updateOrderStatusAction, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Status</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Tracking #</label>
        <input
          name="trackingNumber"
          defaultValue={currentTrackingNumber}
          placeholder="e.g. 1Z999AA1..."
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-[0.1em] text-foreground">Tracking URL</label>
        <input
          name="trackingUrl"
          defaultValue={currentTrackingUrl}
          placeholder="https://..."
          className="w-full border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-700">{state.success}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full border border-foreground bg-foreground px-4 py-2 text-xs tracking-[0.15em] uppercase text-background hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
