import { LoadingScreen } from "@/components/animations/LoadingScreen";

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-2xl tracking-widest uppercase text-foreground/40">
          Coming soon
        </p>
      </div>
    </>
  );
}
