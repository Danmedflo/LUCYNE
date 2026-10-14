"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import StoreHeader from "@/components/store-header";
import StoreFooter from "@/components/store-footer";

// Aquí irá el número real de la tienda:
// código de país + número, sin espacios ni signo +.
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").trim();

const whatsappUrl = /^[1-9]\d{7,14}$/.test(WHATSAPP_NUMBER)
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "¡Hola, LUCYNE! Me gustaría consultar por sus prendas.",
    )}`
  : null;

const collections = [
  {
    id: "mujer",
    title: "Mujer",
    subtitle: "Tu esencia, tu forma de vestir.",
    image: "/images/mujer-lucyne.png",
    alt: "Estilo de muestra: polo negro y pantalón claro para mujer",
  },
  {
    id: "hombre",
    title: "Hombre",
    subtitle: "Comodidad que se lleva con actitud.",
    image: "/images/hombre-lucyne.png",
    alt: "Estilo de muestra: sobrecamisa gris y pantalón negro para hombre",
  },
];

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduceMotion ? 0 : 0.65,
        delay: reduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function ChatIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      <path d="M8 11h8M8 14h5" />
    </svg>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();

  const entrance = (delay: number) => ({
    initial: reduceMotion
      ? false
      : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.7,
      delay: reduceMotion ? 0 : delay,
    },
  });

  return (
    <div id="inicio" className="min-h-screen bg-white text-black">
      <StoreHeader active="home" />

      <main id="lucyne-main" tabIndex={-1} className="scroll-mt-32">
        {/* PORTADA */}
        <section
          aria-labelledby="titulo-portada"
          className="relative isolate overflow-hidden bg-[#E5E2DD]"
        >
          <motion.div
            initial={reduceMotion ? false : { scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 1.3 }}
            className="relative h-72 sm:h-96 md:absolute md:inset-0 md:h-full"
          >
            <Image
              src="/images/portada-lucyne.png"
              alt="Dos modelos con prendas de estilo casual en tonos neutros"
              fill
              preload
              sizes="100vw"
              className="object-cover object-right md:object-center"
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#E5E2DD]/70 via-transparent to-transparent md:block" />

          <div className="relative mx-auto flex max-w-[1600px] items-center px-6 py-12 md:min-h-[640px] md:px-12 md:py-20 lg:min-h-[720px]">
            <div className="max-w-xl md:w-[45%]">
              <motion.p
                {...entrance(0.1)}
                className="mb-6 text-xs font-bold tracking-[0.25em] text-[#9D174D] uppercase"
              >
                Bienvenido a LUCYNE
              </motion.p>

              <motion.h1
                {...entrance(0.2)}
                id="titulo-portada"
                className="text-[clamp(3.6rem,7vw,7.8rem)] leading-[0.95] font-extrabold tracking-[-0.065em]"
              >
                Tu estilo.
                <br />
                A tu
                <br />
                manera<span className="text-[#EF2E7E]">.</span>
              </motion.h1>

              <motion.p
                {...entrance(0.35)}
                className="mt-7 text-lg text-black/75 md:text-xl"
              >
                Prendas que van contigo.
              </motion.p>

              <motion.div {...entrance(0.5)} className="mt-9">
                <Link
                  href="/catalogo"
                  className="inline-flex min-h-14 items-center gap-8 bg-black px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#292929]"
                >
                  Explorar catálogo
                  <span aria-hidden="true" className="text-xl">
                    ↗
                  </span>
                </Link>
              </motion.div>

              <motion.p
                {...entrance(0.65)}
                className="mt-12 text-xs tracking-[0.12em] text-black/60 uppercase"
              >
                Un estilo propio empieza contigo
              </motion.p>
            </div>
          </div>
        </section>

        {/* COLECCIONES */}
        <section
          id="colecciones"
          aria-labelledby="titulo-colecciones"
          className="mx-auto max-w-[1600px] scroll-mt-36 px-6 py-16 md:px-12 md:py-24"
        >
          <Reveal className="mb-10">
            <p className="mb-3 text-xs font-bold tracking-[0.22em] text-[#B91C5B] uppercase">
              Encuentra tu inspiración
            </p>

            <h2
              id="titulo-colecciones"
              className="max-w-3xl text-4xl leading-tight font-bold tracking-[-0.045em] md:text-5xl"
            >
              Dos colecciones.
              <br />
              Infinitas formas de ser tú.
            </h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {collections.map((collection, index) => (
              <Reveal key={collection.id} delay={index * 0.1}>
                <article
                  id={collection.id}
                  className="group relative isolate aspect-[4/5] scroll-mt-36 overflow-hidden bg-[#E5E5E5]"
                >
                  <Image
                    src={collection.image}
                    alt={collection.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.035]"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-10">
                    <p className="mb-3 text-xs tracking-[0.2em] uppercase">
                      LUCYNE / Colección
                    </p>

                    <h3 className="text-5xl font-bold tracking-[-0.045em] uppercase md:text-6xl">
                      {collection.title}
                    </h3>

                    <p className="mt-3 text-sm text-white/90 md:text-base">
                      {collection.subtitle}
                    </p>

                    <Link
                      href={"/catalogo?audience=" + collection.id}
                      className="mt-6 inline-flex items-center gap-4 border-b border-white/60 pb-2 text-sm font-medium"
                    >
                      Explorar colección
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* IDENTIDAD */}
        <section className="bg-[#F2F2F2] px-6 py-20 md:py-28">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-xs font-bold tracking-[0.25em] text-[#B91C5B] uppercase">
              Así somos
            </p>

            <h2 className="text-4xl leading-tight font-bold tracking-[-0.045em] md:text-6xl">
              La mejor versión de ti
              <br />
              sigue siendo tú.
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-black/65 md:text-lg">
              En LUCYNE creemos en vestir con libertad, sentirte cómodo
              y encontrar prendas que acompañen tu propia forma de ser.
            </p>
          </Reveal>
        </section>

        {/* CONTACTO: APARECE AL CONFIGURAR EL NÚMERO */}
        {whatsappUrl && (
          <section
            id="contacto"
            className="scroll-mt-36 px-6 py-20 text-center md:py-24"
          >
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                ¿Encontramos tu próximo look?
              </h2>

              <p className="mt-5 text-black/65">
                Consulta por prendas, tallas y disponibilidad.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-3 bg-black px-7 py-4 font-medium text-white transition-colors hover:bg-[#292929]"
              >
                <ChatIcon />
                Conversar por WhatsApp
                <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </section>
        )}
      </main>

      <StoreFooter />

      {/* BOTÓN FLOTANTE */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consultar a LUCYNE por WhatsApp"
          className="fixed right-5 bottom-5 z-50 inline-flex min-h-14 items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold shadow-lg transition-colors hover:bg-[#F2F2F2] md:right-8 md:bottom-8"
        >
          <span className="text-[#16803C]">
            <ChatIcon />
          </span>
          ¿Te ayudamos?
        </a>
      )}
    </div>
  );
}
