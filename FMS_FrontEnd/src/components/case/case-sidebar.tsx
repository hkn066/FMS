"use client";

import { Building2, Car, Mail, Phone, User } from "lucide-react";
import type { Case, Client } from "@/types";
import { CASE_STATUSES } from "@/constants/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CaseSidebarProps {
  caseData: Case;
  client?: Client;
}

export function CaseSidebar({ caseData, client }: CaseSidebarProps) {
  const statusConfig = CASE_STATUSES[caseData.status];

  return (
    <div className="space-y-4">
      <Card className="sticky top-20">
        <CardHeader className="pb-3">
          <CardTitle>Dava Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Dosya Numarası</p>
            <p className="mt-1 font-mono text-sm text-slate-900">{caseData.caseNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Durum</p>
            <span className={`mt-1 inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Mahkeme & Esas No</p>
            <p className="mt-1 text-sm text-slate-900">{caseData.court || "—"}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-600">
              {caseData.courtBasisNumber ? `Esas: ${caseData.courtBasisNumber}` : "[Esas Bekleniyor]"}
              {caseData.decisionNumber ? ` · Karar: ${caseData.decisionNumber}` : ""}
            </p>
          </div>
          {caseData.counterpartyName && (
            <div>
              <p className="text-xs font-medium text-slate-500">Karşı Taraf</p>
              <p className="mt-1 text-sm text-slate-900">{caseData.counterpartyName}</p>
              {caseData.counterpartyLawyer && (
                <p className="text-xs text-slate-500 mt-0.5">Vekili: {caseData.counterpartyLawyer}</p>
              )}
            </div>
          )}
          {caseData.hasSubjectVehicle && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <Car className="h-3.5 w-3.5 text-accent" />
                Davaya Konu Araç
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                {caseData.vehiclePlate || "—"}
              </p>
              {caseData.vehicleInfo && (
                <p className="text-xs text-slate-500 mt-0.5">{caseData.vehicleInfo}</p>
              )}
            </div>
          )}
          {caseData.claimAmount && (
            <div>
              <p className="text-xs font-medium text-slate-500">Dava / Talep Değeri</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">
                {formatCurrency(caseData.claimAmount)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-slate-500">Kategori</p>
            <p className="mt-1 text-sm text-slate-900">{caseData.category}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sorumlu Avukat</p>
            <p className="mt-1 text-sm text-slate-900">{caseData.lawyerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Açılış Tarihi</p>
            <p className="mt-1 text-sm text-slate-900">{formatDate(caseData.openedAt)}</p>
          </div>
          {caseData.nextHearing && (
            <div>
              <p className="text-xs font-medium text-slate-500">Sonraki Duruşma</p>
              <p className="mt-1 text-sm font-medium text-accent">{formatDate(caseData.nextHearing)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {client && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Müvekkil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                {client.type === "corporate" ? (
                  <Building2 className="h-5 w-5 text-accent" />
                ) : (
                  <User className="h-5 w-5 text-accent" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{client.name}</p>
                <p className="text-xs text-slate-500">
                  {client.type === "corporate" ? "Kurumsal" : "Bireysel"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-500">{client.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
