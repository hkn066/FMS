"use client";

import { useSidebarStore } from "@/store/ui-store";
import { AuthGuard } from "@/components/shared/auth-guard";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div
          className={cn(
            "flex min-h-screen flex-col transition-all duration-300",
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
          )}
        >
          <Topbar title={title} />
          <main className="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
          <MobileNav />
        </div>
      </div>
    </AuthGuard>
  );
}
