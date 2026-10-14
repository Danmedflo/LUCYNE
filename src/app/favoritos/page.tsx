import { Suspense } from "react";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";
import styles from "@/components/store-shell.module.css";
import FavoritesBrowser from "./favorites-browser";

export const metadata = {
  title: "Mis favoritos | LUCYNE",
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return (
    <>
    <StoreHeader active="favorites" />
    <main id="lucyne-main" tabIndex={-1} className={styles.main + " bg-[#F2F2F2] px-5 pb-16 pt-4 text-black sm:px-8 sm:pb-24 sm:pt-6"}>
      <div className="mx-auto max-w-7xl">
        <header className={styles.enter + " py-10 sm:py-14"}>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#B91C5B]">Tu próxima elección</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Tus favoritos<span className="text-[#EF2E7E]">.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/60">Las prendas que te gustan, juntas en un solo lugar. Se guardan en este navegador; no necesitas una cuenta.</p>
        </header>
        <Suspense fallback={<p role="status">Cargando favoritos…</p>}>
          <FavoritesBrowser />
        </Suspense>
      </div>
    </main>
    <StoreFooter />
    </>
  );
}
