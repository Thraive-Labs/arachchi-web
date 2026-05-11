"use client";

import { useActionState } from "react";
import { updateUserRoleAction } from "@/app/actions/admin";

type Role = "customer" | "staff" | "admin";

interface RoleSelectorProps {
  userId: string;
  currentRole: Role;
}

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const [state, formAction] = useActionState(updateUserRoleAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="bg-transparent text-xs border border-border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-foreground cursor-pointer"
      >
        <option value="customer">customer</option>
        <option value="staff">staff</option>
        <option value="admin">admin</option>
      </select>
      {state?.error && (
        <p className="text-[11px] text-destructive">{state.error}</p>
      )}
    </form>
  );
}
