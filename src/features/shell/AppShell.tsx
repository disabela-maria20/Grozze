"use client";

import { ClientOnly } from "@/shared/ui/ClientOnly";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { CookieBanner } from "./CookieBanner";
import { DialogRoot } from "./DialogRoot";
import { Toast } from "./Toast";

/**
 * Site chrome, mounted once in the root layout. Only the chrome itself
 * (header, footer, dialogs, toast) skips SSR — it depends on client-only
 * state (login, favorites, consent) read from localStorage. Page content
 * (`children`) is rendered normally: static pages (legal, FAQ) stay real
 * server-rendered HTML, while personalization-heavy feature pages opt into
 * `ClientOnly` themselves (see `shared/ui/ClientOnly`), same split the
 * former Astro version had between plain pages and `client:only` islands.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientOnly>
        <Header />
      </ClientOnly>
      <main id="app">{children}</main>
      <ClientOnly>
        <Footer />
        <BottomNav />
        <div id="movie-sticky" />
        <CookieBanner />
        <DialogRoot />
        <Toast />
      </ClientOnly>
    </>
  );
}
