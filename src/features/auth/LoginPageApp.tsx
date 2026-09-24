"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/shared/store/store";
import { AuthDialog } from "./AuthDialog";

export function LoginPageApp({ signup }: { signup: boolean }) {
  const logged = useAppStore((s) => s.logged());
  const router = useRouter();

  useEffect(() => {
    if (logged) router.replace("/minha-grozze");
  }, [logged, router]);

  if (logged) return null;

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,530px)] max-sm:w-[calc(100%-32px)] mx-auto">
        <div className="p-6 max-sm:p-4.5 border border-line bg-surface rounded-app">
          <AuthDialog signup={signup} />
        </div>
      </div>
    </div>
  );
}
