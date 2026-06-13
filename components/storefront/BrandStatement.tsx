export function BrandStatement() {
  return (
    <section
      className="pb-10 pt-16 lg:px-32 lg:pb-14 lg:pt-24"
      aria-label="Brand story"
    >
      {/* Section header */}
      <div className="border-t border-foreground/12 pb-10 pt-8">
        <h2 className="text-sm tracking-[0.4em] uppercase text-muted-foreground">
          Our Story
        </h2>
      </div>

      {/* Statement */}
      <p className="max-w-3xl font-serif text-3xl font-light leading-[1.45] text-foreground md:text-4xl lg:text-5xl">
        We make clothing for a considered life — pieces designed to outlast
        seasons, trends, and the impulse that bought them.
      </p>

      {/* Supporting copy */}
      <p className="mt-6 max-w-xl text-sm leading-[1.85] text-muted-foreground">
        Arachchi is a Toronto-based luxury label. Every piece is cut, sewn, and
        finished by artisans who have spent their lives mastering one discipline.
        We source materials that age well — wool that softens with wear, cotton
        that holds its shape, leather that develops a patina over years of use.
        Nothing is rushed. Nothing is disposable. Just clothing made to earn its
        place in a wardrobe for a very long time.
      </p>
    </section>
  );
}
