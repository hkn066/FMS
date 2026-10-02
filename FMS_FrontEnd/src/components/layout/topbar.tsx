"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { useSidebarStore } from "@/store/ui-store";
import { SearchModal } from "@/components/layout/search-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/utils";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter();
  const { setMobileOpen } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile Menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page Title */}
      {title && (
        <h1 className="hidden text-lg font-semibold tracking-tight sm:block">{title}</h1>
      )}

      {/* Global Search */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="relative ml-auto flex h-9 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 text-left text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-border dark:bg-muted/30 dark:hover:bg-muted/50"
        aria-label="Global arama (Ctrl+K)"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="flex-1 truncate">Dosya, müvekkil, dava veya belge ara…</span>
        <kbd className="pointer-events-none hidden shrink-0 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 sm:flex dark:border-border dark:bg-card">
          ⌘K
        </kbd>
      </button>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      <div className="flex items-center gap-1">
        {/* Quick Create */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="accent" size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Yeni Oluştur</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Hızlı Oluştur</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Yeni Dava</DropdownMenuItem>
            <DropdownMenuItem>Yeni Müvekkil</DropdownMenuItem>
            <DropdownMenuItem>Belge Yükle</DropdownMenuItem>
            <DropdownMenuItem>Görev Oluştur</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Bildirimler
              {unreadCount > 0 && <Badge variant="accent">{unreadCount} yeni</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-72">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 border-b border-border p-3 last:border-0",
                    !notification.read && "bg-accent/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDateTime(notification.timestamp)}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[10px]">
                  {getInitials(user?.fullName ?? "U")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.fullName ?? "Kullanıcı"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Ayarlar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
