"use client";

import { motion } from "framer-motion";
import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  format?: "number" | "currency";
  index?: number;
}

export function StatCard({ title, value, change, icon: Icon, format = "number", index = 0 }: StatCardProps) {
  const displayValue = format === "currency" && typeof value === "number" ? formatCurrency(value) : value;
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-2xl font-medium tracking-tight text-slate-900">{displayValue}</p>
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  {isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isPositive
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400",
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {change}%
                  </span>
                  <span className="text-xs text-slate-500">geçen aya göre</span>
                </div>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Icon className="h-5 w-5 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
