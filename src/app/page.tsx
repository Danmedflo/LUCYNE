import { Suspense } from "react";
import HomeShell from "./home-shell";
import HomeProducts, { HomeProductsSkeleton } from "@/components/home-products";

export default function HomePage() {
  return (
    <HomeShell
      newest={<Suspense fallback={<HomeProductsSkeleton kind="recent" />}><HomeProducts kind="recent" /></Suspense>}
      featured={<Suspense fallback={<HomeProductsSkeleton kind="featured" />}><HomeProducts kind="featured" /></Suspense>}
    />
  );
}
