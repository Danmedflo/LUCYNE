"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/lib/favorites-store";
import styles from "./store-shell.module.css";

const links = [
  { href: "/", label: "Inicio", section: "home" },
  { href: "/catalogo", label: "Catálogo", section: "catalog" },
  { href: "/catalogo?audience=mujer", label: "Mujer", section: "" },
  { href: "/catalogo?audience=hombre", label: "Hombre", section: "" },
];

export default function StoreHeader({ active }: { active?: "home" | "catalog" | "favorites" }) {
  const { ids, ready } = useFavorites();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 900px)");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    const onResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <a href="#lucyne-main" className={styles.skip}>Saltar al contenido</a>
      <header ref={headerRef} className={styles.header} onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
        <div className={styles.strip}>TU ESTILO. A TU MANERA.</div>
        <div className={styles.headerRow}>
          <Link href="/" aria-label="LUCYNE, inicio" className={styles.brand} onClick={() => setOpen(false)}>
            <Image src="/images/logo-lucyne.png" width={176} height={62} alt="LUCYNE" className={styles.logo} />
          </Link>
          <nav aria-label="Navegación principal" className={styles.desktopNav}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} aria-current={active === link.section ? "page" : undefined} className={styles.navLink}>{link.label}</Link>
            ))}
          </nav>
          <div className={styles.actions}>
            <Link href="/favoritos" onClick={() => setOpen(false)} aria-current={active === "favorites" ? "page" : undefined} aria-label={"Favoritos" + (ready ? ", " + ids.length + " prendas guardadas" : "")} className={styles.favorites}>
              <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
              <span className={styles.favoriteLabel}>Favoritos</span>
              {ready && ids.length > 0 && <span className={styles.count}>{ids.length}</span>}
            </Link>
            <button ref={buttonRef} type="button" aria-controls={menuId} aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen((value) => !value)} className={styles.menuButton}>
              <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                {open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        <div id={menuId} hidden={!open} className={styles.mobilePanel}>
          <nav aria-label="Navegación móvil" className={styles.mobileNav}>
            {links.map((link, index) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={active === link.section ? "page" : undefined} className={styles.mobileLink}>
                <span className={styles.linkNumber}>0{index + 1}</span><span>{link.label}</span><span aria-hidden="true" className={styles.linkArrow}>↗</span>
              </Link>
            ))}
            <Link href="/favoritos" onClick={() => setOpen(false)} aria-current={active === "favorites" ? "page" : undefined} className={styles.mobileLink}>
              <span className={styles.linkNumber}>05</span><span>Favoritos</span><span aria-hidden="true" className={styles.linkArrow}>↗</span>
            </Link>
          </nav>
          <p className={styles.mobileNote}>Prendas que van contigo.</p>
        </div>
      </header>
    </>
  );
}
