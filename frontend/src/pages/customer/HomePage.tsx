// Full landing page (hero, món nổi bật, khuyến mãi, đánh giá...) is built in Phase 4.
export default function HomePage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-5xl text-brand-800">Mây Vegan</h1>
      <p className="text-lg text-[var(--text-muted)]">
        Một chút xanh cho một ngày an lành.
      </p>
    </section>
  );
}
