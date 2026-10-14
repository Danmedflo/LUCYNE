"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    { error: "" },
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F2F2] px-6 py-12">
      <section className="w-full max-w-md border border-black/10 bg-white p-8 md:p-10">
        <Link
          href="/"
          aria-label="Volver a LUCYNE"
          className="relative mx-auto block h-20 w-56"
        >
          <Image
            src="/images/logo-lucyne.png"
            alt="LUCYNE"
            fill
            sizes="224px"
            className="object-contain"
          />
        </Link>

        <p className="mt-6 text-center text-xs font-bold tracking-[0.2em] text-[#B91C5B] uppercase">
          Administración
        </p>

        <h1 className="mt-3 text-center text-3xl font-bold tracking-tight">
          Bienvenida de nuevo.
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-black/60">
          Ingresa para gestionar el catálogo de LUCYNE.
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full border border-black/20 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-black/20 bg-white px-4 py-3"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full cursor-pointer bg-black px-5 py-4 font-semibold text-white transition-colors hover:bg-[#292929] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-7 block text-center text-sm text-black/60 hover:text-black"
        >
          ← Volver a la tienda
        </Link>
      </section>
    </main>
  );
}