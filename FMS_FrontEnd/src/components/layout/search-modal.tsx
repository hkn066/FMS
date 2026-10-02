"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CornerDownLeft,
  FileText,
  Loader2,
  Paperclip,
  Scale,
  Search,
  ShieldAlert,
  User,
} from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResultItem = {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  category: "clients" | "cases" | "arbitrations" | "documents";
  icon: React.ElementType;
};

const CATEGORY_LABELS: Record<SearchResultItem["category"], string> = {
  clients: "Müvekkiller",
  cases: "Genel Davalar",
  arbitrations: "Sigorta Tahkim Dosyaları",
  documents: "Dokümanlar",
};

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { query, setQuery, results, isLoading, isSearchable, minQueryLength, error } = useSearch();

  const items = useMemo<SearchResultItem[]>(() => {
    if (!results) return [];

    const clientItems: SearchResultItem[] = results.clients.map((client) => ({
      id: `client-${client.id}`,
      label: client.name,
      sublabel: client.email,
      href: "/clients",
      category: "clients",
      icon: client.type === "CORPORATE" ? Building2 : User,
    }));

    const caseItems: SearchResultItem[] = results.cases.map((caseItem) => ({
      id: `case-${caseItem.id}`,
      label: caseItem.title,
      sublabel: caseItem.caseNumber,
      href: `/cases/${caseItem.id}`,
      category: "cases",
      icon: Scale,
    }));

    const arbitrationItems: SearchResultItem[] = results.arbitrations.map((arb) => ({
      id: `arb-${arb.id}`,
      label: arb.folderName,
      sublabel: [arb.licensePlate, arb.clientNameSurname].filter(Boolean).join(" · "),
      href: `/arbitration/${arb.id}`,
      category: "arbitrations",
      icon: ShieldAlert,
    }));

    const documentItems: SearchResultItem[] = results.documents.map((doc) => ({
      id: `doc-${doc.id}`,
      label: doc.name,
      sublabel: doc.folderPath,
      href: doc.arbitrationCaseId
        ? `/arbitration/${doc.arbitrationCaseId}`
        : doc.caseId
          ? `/cases/${doc.caseId}`
          : "/documents",
      category: "documents",
      icon: Paperclip,
    }));

    return [...clientItems, ...caseItems, ...arbitrationItems, ...documentItems];
  }, [results]);

  const groupedItems = useMemo(() => {
    const groups: { category: SearchResultItem["category"]; items: SearchResultItem[] }[] = [];
    const order: SearchResultItem["category"][] = ["clients", "cases", "arbitrations", "documents"];

    for (const category of order) {
      const categoryItems = items.filter((item) => item.category === category);
      if (categoryItems.length > 0) {
        groups.push({ category, items: categoryItems });
      }
    }

    return groups;
  }, [items]);

  const navigateTo = useCallback(
    (item: SearchResultItem) => {
      onOpenChange(false);
      setQuery("");
      setActiveIndex(-1);
      router.push(item.href);
    },
    [onOpenChange, router, setQuery],
  );

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
    setQuery("");
    setActiveIndex(-1);
  }, [open, setQuery]);

  useEffect(() => {
    setActiveIndex(items.length > 0 ? 0 : -1);
  }, [items]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      navigateTo(items[activeIndex]);
    }
  };

  const showEmptyHint = !isSearchable && query.trim().length === 0;
  const showMinLengthHint = !isSearchable && query.trim().length > 0;
  const showNoResults = isSearchable && !isLoading && !error && items.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl gap-0 overflow-hidden border-slate-200/80 bg-white p-0 shadow-2xl dark:border-border dark:bg-card"
        onKeyDown={handleKeyDown}
        aria-label="Global arama"
      >
        <DialogTitle className="sr-only">Global Arama</DialogTitle>

        <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-border">
          <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dosya, müvekkil, dava veya belge ara…"
            className="h-14 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="search-results-list"
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Aranıyor" />
          )}
        </div>

        <div
          ref={listRef}
          id="search-results-list"
          role="listbox"
          aria-label="Arama sonuçları"
          className="max-h-[min(420px,50vh)] overflow-y-auto"
        >
          {error && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-900">Arama başarısız</p>
              <p className="mt-1 text-sm text-slate-500">{(error as Error).message}</p>
            </div>
          )}

          {showEmptyHint && (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">Hızlı arama</p>
              <p className="mt-1 text-sm text-slate-500">
                Müvekkil, dava, tahkim dosyası veya belge aramak için yazmaya başlayın
              </p>
            </div>
          )}

          {showMinLengthHint && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                En az {minQueryLength} karakter girin
              </p>
            </div>
          )}

          {showNoResults && (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">Sonuç bulunamadı</p>
              <p className="mt-1 text-sm text-slate-500">
                &ldquo;{query.trim()}&rdquo; için eşleşen kayıt yok
              </p>
            </div>
          )}

          {groupedItems.map((group) => (
            <div key={group.category} role="group" aria-label={CATEGORY_LABELS[group.category]}>
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/95 px-4 py-2 backdrop-blur-sm dark:border-border dark:bg-muted/80">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {CATEGORY_LABELS[group.category]}
                </p>
              </div>
              <ul className="py-1">
                {group.items.map((item) => {
                  const index = items.indexOf(item);
                  const Icon = item.icon;
                  const isActive = index === activeIndex;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        id={`search-result-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => navigateTo(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                          isActive ? "bg-slate-100 dark:bg-muted" : "hover:bg-slate-50 dark:hover:bg-muted/50",
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white dark:border-border dark:bg-card">
                          <Icon className="h-4 w-4 text-slate-600 dark:text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
                            {item.label}
                          </p>
                          {item.sublabel && (
                            <p className="truncate text-xs text-slate-500">{item.sublabel}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500 dark:border-border dark:bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-border dark:bg-card">
                <ArrowUp className="inline h-3 w-3" />
              </kbd>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-border dark:bg-card">
                <ArrowDown className="inline h-3 w-3" />
              </kbd>
              <span className="ml-0.5">gezin</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-border dark:bg-card">
                <CornerDownLeft className="inline h-3 w-3" />
              </kbd>
              <span className="ml-0.5">seç</span>
            </span>
          </div>
          <span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono dark:border-border dark:bg-card">
              esc
            </kbd>{" "}
            kapat
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
