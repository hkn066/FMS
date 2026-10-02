import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function FinancePage() {
  return (
    <AppShell title="Finans">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Finans Yönetimi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gelir, gider ve faturaları yönetin</p>
        </div>
        <Card>
          <CardContent className="flex h-64 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Finans modülü yakında aktif olacak.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
