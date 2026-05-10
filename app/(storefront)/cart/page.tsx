import type { Metadata } from "next";
import { CartPageContent } from "./CartPageContent";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-24 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-10">Your cart</h1>
      <CartPageContent />
    </div>
  );
}
