import Link from "next/link";
import styles from "./store-shell.module.css";

export default function StoreFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div>
            <p className={styles.eyebrow}>LUCYNE</p>
            <p className={styles.footerTitle}>Tu estilo.<br />A tu manera<span>.</span></p>
            <p className={styles.footerText}>Explora la colección y encuentra tus próximas favoritas.</p>
          </div>
          <Link href="/catalogo" className={styles.catalogButton}>Explorar el catálogo <span aria-hidden="true">↗</span></Link>
        </div>
        <div className={styles.footerBottom}>
          <p>© LUCYNE</p>
          <nav aria-label="Enlaces del pie de página" className={styles.footerNav}>
            <Link href="/">Inicio</Link>
            <Link href="/catalogo?audience=mujer">Mujer</Link>
            <Link href="/catalogo?audience=hombre">Hombre</Link>
            <Link href="/catalogo?audience=unisex">Unisex</Link>
            <Link href="/favoritos">Favoritos</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
