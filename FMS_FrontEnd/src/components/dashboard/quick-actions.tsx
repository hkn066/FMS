"use client";

import Link from "next/link";
import { Plus, Upload, UserPlus, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  { label: "Yeni Dava", icon: Plus, href: "/cases/new" },
  { label: "Müvekkil Ekle", icon: UserPlus, href: "/clients/new" },
  { label: "Belge Yükle", icon: Upload, href: "/documents" },
  { label: "Duruşma Ekle", icon: CalendarPlus, href: "/calendar" },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col gap-2 border-slate-100 py-4 hover:bg-slate-50 dark:border-border dark:hover:bg-muted/50"
                asChild
              >
                <Link href={action.href}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
