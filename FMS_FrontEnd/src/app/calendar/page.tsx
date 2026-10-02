import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <AppShell title="Takvim">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Takvim & Duruşmalar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Duruşma ve görev takviminizi yönetin</p>
        </div>
        <Card>
          <CardContent className="flex h-96 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Takvim modülü yakında aktif olacak.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
