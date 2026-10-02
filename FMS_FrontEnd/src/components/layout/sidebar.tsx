"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Scale } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { CasesNavGroup } from "@/components/layout/cases-nav-group";
import { mainNavItems, type NavItem } from "@/constants/navigation";
import { useSidebarStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, setMobileOpen } = useSidebarStore();
  const user = useAuthStore((s) => s.user);

  function renderNavItem(item: NavItem) {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-active text-white"
            : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
          isCollapsed && "justify-center px-2",
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl bg-sidebar-active"
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          />
        )}
        <Icon
          className={cn(
            "relative z-10 h-[18px] w-[18px] shrink-0",
            isActive ? "text-accent" : "text-sidebar-foreground group-hover:text-white",
          )}
        />
        {!isCollapsed && <span className="relative z-10 truncate">{item.title}</span>}
        {!isCollapsed && item.badge && (
          <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 text-[10px] font-semibold text-accent">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
            {item.badge && ` (${item.badge})`}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className={cn("flex h-16 items-center gap-3 px-4", isCollapsed && "justify-center px-2")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20">
          <Scale className="h-5 w-5 text-accent" />
        </div>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Hukuk FMS</p>
            <p className="truncate text-xs text-sidebar-foreground">Dosya Yönetim Sistemi</p>
          </motion.div>
        )}
      </div>

      <Separator className="bg-sidebar-active" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-1">
            {mainNavItems.slice(0, 2).map((item) => renderNavItem(item))}
            <Suspense fallback={null}>
              <CasesNavGroup isCollapsed={isCollapsed} onNavigate={() => setMobileOpen(false)} />
            </Suspense>
            {mainNavItems.slice(2).map((item) => renderNavItem(item))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-sidebar-active p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5",
            isCollapsed && "justify-center",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent/20 text-[10px] text-accent">
              {getInitials(user?.fullName ?? "U")}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.fullName ?? "Kullanıcı"}</p>
              <p className="truncate text-xs text-sidebar-foreground">{user?.role ?? ""}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle - Desktop only */}
      <div className="hidden border-t border-sidebar-active p-3 lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className={cn(
            "w-full text-sidebar-foreground hover:bg-white/5 hover:text-white",
            isCollapsed && "px-2",
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          {!isCollapsed && <span>Daralt</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-active lg:block"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
