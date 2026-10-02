"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ErrorState, TableLoader } from "@/components/shared/page-loader";
import { useClients } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientsPage() {
  const { data, isLoading, error, refetch } = useClients();

  return (
    <AppShell title="Müvekkiller">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Müvekkiller</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Müvekkil kayıtlarınızı yönetin
            {data?.total !== undefined && ` · ${data.total} kayıt`}
          </p>
        </div>

        {isLoading && <TableLoader />}
        {error && <ErrorState message="Müvekkiller yüklenemedi" onRetry={() => refetch()} />}

        {data && (
          <div className="grid gap-3">
            {data.clients.length === 0 ? (
              <Card>
                <CardContent className="flex h-32 items-center justify-center p-6">
                  <p className="text-sm text-muted-foreground">Henüz müvekkil kaydı yok.</p>
                </CardContent>
              </Card>
            ) : (
              data.clients.map((client) => (
                <Card key={client.id} className="transition-colors hover:bg-hover">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {client.type === "corporate" ? "Kurumsal" : "Bireysel"}
                      </Badge>
                      <Badge variant={client.status === "active" ? "success" : "secondary"}>
                        {client.status === "active" ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
