import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { mockNotifications } from "@/lib/mock-data";
import { cn, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  return (
    <AppShell title="Bildirimler">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Bildirim Merkezi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tüm bildirimlerinizi görüntüleyin</p>
        </div>
        <div className="space-y-2">
          {mockNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(!notification.read && "border-accent/30 bg-accent/5")}
            >
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {!notification.read && <Badge variant="accent">Yeni</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(notification.timestamp)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
