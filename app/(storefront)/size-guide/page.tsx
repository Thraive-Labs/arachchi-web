import type { Metadata } from "next";

export const metadata: Metadata = { title: "Size Guide" };

const clothingChart = [
  { size: "XS", ca_us: "0–2", uk: "4–6", eu: "32–34", bust: "81–84", waist: "61–64", hips: "86–89" },
  { size: "S", ca_us: "4–6", uk: "8–10", eu: "36–38", bust: "86–89", waist: "66–69", hips: "91–94" },
  { size: "M", ca_us: "8–10", uk: "12–14", eu: "40–42", bust: "91–94", waist: "71–74", hips: "96–99" },
  { size: "L", ca_us: "12–14", uk: "16–18", eu: "44–46", bust: "96–99", waist: "76–79", hips: "101–104" },
  { size: "XL", ca_us: "16–18", uk: "20–22", eu: "48–50", bust: "101–104", waist: "81–84", hips: "106–109" },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-8">
      <h1 className="font-serif text-3xl font-light tracking-wide mb-4">Size Guide</h1>
      <p className="mb-10 text-sm text-muted-foreground">All measurements are in centimetres. If you are between sizes, we recommend sizing up for a relaxed fit.</p>

      <section>
        <h2 className="mb-4 text-xs tracking-[0.2em] uppercase text-foreground">Clothing</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Size", "CA/US", "UK", "EU", "Bust (cm)", "Waist (cm)", "Hips (cm)"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs tracking-[0.1em] uppercase text-muted-foreground font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clothingChart.map((row) => (
                <tr key={row.size}>
                  <td className="px-3 py-3 text-foreground font-medium">{row.size}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.ca_us}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.uk}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.eu}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.bust}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.waist}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xs tracking-[0.2em] uppercase text-foreground">How to measure</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p><span className="text-foreground">Bust:</span> Measure around the fullest part of your chest, keeping the tape parallel to the floor.</p>
          <p><span className="text-foreground">Waist:</span> Measure around your natural waistline — the narrowest part of your torso.</p>
          <p><span className="text-foreground">Hips:</span> Measure around the fullest part of your hips, approximately 20 cm below your natural waistline.</p>
        </div>
      </section>
    </div>
  );
}
