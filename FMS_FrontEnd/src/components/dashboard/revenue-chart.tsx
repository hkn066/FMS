"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueChart() {
  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Finans Özeti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-amber-100 bg-gradient-to-b from-amber-50/40 to-white px-6 py-10 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-800">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-900">Finans Modülü Entegrasyonu Bekleniyor</p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500">
            Aylık gelir ve gider grafikleri, finans modülü backend API&apos;si devreye alındığında
            otomatik olarak burada görüntülenecek.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
