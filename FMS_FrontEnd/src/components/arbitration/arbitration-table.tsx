"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight } from "lucide-react";
import type { ArbitrationCase } from "@/types/arbitration";
import { DataTable } from "@/components/shared/data-table";
import {
  ArbitrationStatusBadge,
  PendingEsasBadge,
} from "@/components/arbitration/arbitration-badges";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

function CourtBasisCell({ value }: { value?: string | null }) {
  if (!value || value.trim() === "") {
    return <PendingEsasBadge />;
  }
  return <span className="font-mono text-xs text-foreground">{value}</span>;
}

const columns: ColumnDef<ArbitrationCase>[] = [
  {
    accessorKey: "licensePlate",
    header: "Plaka",
    cell: ({ row }) => (
      <Link
        href={`/arbitration/${row.original.id}`}
        className="font-medium hover:text-accent transition-colors"
      >
        {row.getValue("licensePlate")}
      </Link>
    ),
  },
  {
    accessorKey: "clientNameSurname",
    header: "Müvekkil Ad Soyad",
  },
  {
    accessorKey: "courtBasisNumber",
    header: "Esas No",
    cell: ({ row }) => <CourtBasisCell value={row.original.courtBasisNumber} />,
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => {
      const status = row.getValue("status") as ArbitrationCase["status"];
      return <ArbitrationStatusBadge status={status} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Oluşturulma Tarihi",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | undefined;
      return date ? formatDate(date) : "—";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/arbitration/${row.original.id}`}>
          <ArrowUpRight className="h-4 w-4" />
          Detay
        </Link>
      </Button>
    ),
  },
];

interface ArbitrationTableProps {
  cases: ArbitrationCase[];
}

export function ArbitrationTable({ cases }: ArbitrationTableProps) {
  return (
    <DataTable
      columns={columns}
      data={cases}
      searchKey="clientNameSurname"
      searchPlaceholder="Plaka veya müvekkil ara..."
    />
  );
}
