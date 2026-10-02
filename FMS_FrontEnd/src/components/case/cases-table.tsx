"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Car, MoreHorizontal } from "lucide-react";
import type { Case } from "@/types";
import { CASE_STATUSES } from "@/constants/navigation";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

const columns: ColumnDef<Case>[] = [
  {
    accessorKey: "caseNumber",
    header: "Dosya No",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.getValue("caseNumber")}</span>
    ),
  },
  {
    accessorKey: "title",
    header: "Dava Başlığı",
    cell: ({ row }) => (
      <div className="space-y-1">
        <Link
          href={`/cases/${row.original.id}`}
          className="font-medium hover:text-accent transition-colors block"
        >
          {row.getValue("title")}
        </Link>
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
          <span>{row.original.court || "Mahkeme Belirtilmemiş"}</span>
          {row.original.courtBasisNumber && (
            <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
              {row.original.courtBasisNumber}
            </span>
          )}
          {row.original.hasSubjectVehicle && row.original.vehiclePlate && (
            <span className="font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
              <Car className="h-3 w-3" />
              {row.original.vehiclePlate}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Müvekkil",
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as Case["status"];
      const config = CASE_STATUSES[status];
      return (
        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "lawyerName",
    header: "Avukat",
  },
  {
    accessorKey: "nextHearing",
    header: "Sonraki Duruşma",
    cell: ({ row }) => {
      const date = row.getValue("nextHearing") as string | undefined;
      return date ? formatDate(date) : "—";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/cases/${row.original.id}`}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Detay Görüntüle
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Düzenle</DropdownMenuItem>
          <DropdownMenuItem>Belge Ekle</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

interface CasesTableProps {
  cases: Case[];
}

export function CasesTable({ cases }: CasesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={cases}
      searchKey="title"
      searchPlaceholder="Dava ara..."
    />
  );
}
