import { DiscountForm } from "../DiscountForm";
export const metadata = { title: "New Discount — Admin" };
export default function NewDiscountPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light tracking-wide">New discount code</h1>
      <DiscountForm />
    </div>
  );
}
