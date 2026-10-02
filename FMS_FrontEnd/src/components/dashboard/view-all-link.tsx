import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ViewAllLinkProps {
  href: string;
  label?: string;
}

export function ViewAllLink({ href, label = "Tümünü Gör" }: ViewAllLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-200"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
