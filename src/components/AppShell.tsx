"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

const HIDDEN_PATHS = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  return (
    <>
      <div className={`flex flex-1 flex-col ${hideNav ? "" : "pb-16"}`}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}
