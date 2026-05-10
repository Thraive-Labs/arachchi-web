import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { discounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DiscountForm } from "../DiscountForm";

interface Props { params: Promise<{ id: string }> }
export const metadata = { title: "Edit Discount — Admin" };

export default async function EditDiscountPage({ params }: Props) {
  const { id } = await params;
  const [discount] = await db.select().from(discounts).where(eq(discounts.id, id)).limit(1);
  if (!discount) notFound();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light tracking-wide">Edit: {discount.code}</h1>
      <DiscountForm initial={discount} />
    </div>
  );
}
