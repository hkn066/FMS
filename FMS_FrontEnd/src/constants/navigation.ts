import {
  LayoutDashboard,
  Users,
  Folder,
  FileText,
  Scale,
  Calendar,
  CheckSquare,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavSubItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  children: NavSubItem[];
}

export const caseNavGroup: NavGroup = {
  title: "Dosyalar",
  icon: Folder,
  children: [
    { title: "Genel Davalar", href: "/cases", icon: FileText },
    { title: "Sigorta Tahkim", href: "/arbitration", icon: Scale },
  ],
};

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Müvekkiller", href: "/clients", icon: Users },
  { title: "Belgeler", href: "/documents", icon: FileText },
  { title: "Takvim", href: "/calendar", icon: Calendar },
  { title: "Görevler", href: "/tasks", icon: CheckSquare, badge: 5 },
  { title: "Finans", href: "/finance", icon: DollarSign },
  { title: "Mesajlar", href: "/messages", icon: MessageSquare, badge: 3 },
  { title: "Raporlar", href: "/reports", icon: BarChart3 },
  { title: "Ayarlar", href: "/settings", icon: Settings },
];

export const mobileNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Dosyalar", href: "/cases", icon: Folder },
  { title: "Takvim", href: "/calendar", icon: Calendar },
  { title: "Belgeler", href: "/documents", icon: FileText },
  { title: "Bildirimler", href: "/notifications", icon: Bell },
];

export const CASE_STATUSES = {
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending: { label: "Beklemede", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  closed: { label: "Kapalı", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  urgent: { label: "Acil", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
} as const;

export const PRIORITY_LEVELS = {
  low: { label: "Düşük", color: "text-slate-500" },
  medium: { label: "Orta", color: "text-amber-600" },
  high: { label: "Yüksek", color: "text-orange-600" },
  urgent: { label: "Acil", color: "text-red-600" },
} as const;
