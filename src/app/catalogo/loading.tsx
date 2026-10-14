export default function CatalogLoading() {
  return (
    <main className="min-h-screen bg-[#F2F2F2] px-6 py-20 md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold tracking-[0.22em] text-[#B91C5B] uppercase">
          LUCYNE
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Estamos preparando tu próxima inspiración.
        </h1>

        <p role="status" className="mt-6 text-black/60">
          Cargando catálogo…
        </p>
      </div>
    </main>
  );
}