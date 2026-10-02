import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import type { ArbitrationStatus } from "@/types/arbitration";
import { ARBITRATION_STATUSES } from "@/types/arbitration";
import { cn } from "@/lib/utils";

/** Tablo badge — pastel rose (kırmızıya yakın); renkler globals.css utility ile sabitlenir */
export function PendingEsasBadge({
  label = "Esas Bekleniyor",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span role="status" className={cn("badge-esas-pending", className)}>
      <Clock className="badge-esas-pending-icon" aria-hidden />
      {label}
    </span>
  );
}

/** Detay sayfası banner — pastel rose (kırmızıya yakın) minimalist alert */
export function PendingEsasAlert({
  title = "Esas numarası bekleniyor",
  description = "Yargılama esas numarası girildiğinde klasör adı otomatik güncellenir.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" className={cn("alert-esas-pending", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Clock className="alert-esas-pending-icon" aria-hidden />
          <div className="space-y-1">
            <p className="alert-esas-pending-title">{title}</p>
            <p className="alert-esas-pending-desc">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

export function ArbitrationStatusBadge({
  status,
  className,
}: {
  status: ArbitrationStatus;
  className?: string;
}) {
  const config = ARBITRATION_STATUSES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
