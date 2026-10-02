"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Folder } from "lucide-react";
import { caseNavGroup } from "@/constants/navigation";
import { useFolders } from "@/hooks/use-api";
import {
  getArbitrationSidebarFolders,
  getArbitrationStatusFromFolder,
  getGeneralSidebarFolders,
} from "@/lib/folder-tree-utils";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FolderNode } from "@/types/document";

interface CasesNavGroupProps {
  isCollapsed: boolean;
  onNavigate?: () => void;
}

function isCasesSectionActive(pathname: string) {
  return pathname.startsWith("/cases") || pathname.startsWith("/arbitration");
}

function isChildActive(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams> | null,
  href: string,
) {
  const [hrefPath, hrefQuery] = href.split("?");
  if (hrefQuery) {
    if (pathname !== hrefPath) return false;
    const targetParams = new URLSearchParams(hrefQuery);
    for (const [key, value] of targetParams.entries()) {
      if (searchParams?.get(key) !== value) return false;
    }
    return true;
  }

  if (pathname === hrefPath) {
    if (hrefPath === "/arbitration" && (searchParams?.get("status") || searchParams?.get("folder"))) {
      return false;
    }
    if (hrefPath === "/cases" && searchParams?.get("folder")) {
      return false;
    }
    return true;
  }

  return pathname.startsWith(`${hrefPath}/`);
}

function generalFolderNavHref(folder: FolderNode): string {
  if (folder.caseId) {
    return `/cases/${folder.caseId}`;
  }
  return `/cases?folder=${folder.id}`;
}

function folderNavHref(folder: FolderNode): string {
  if (folder.arbitrationCaseId) {
    return `/arbitration/${folder.arbitrationCaseId}`;
  }
  const status = getArbitrationStatusFromFolder(folder);
  if (status) {
    return `/arbitration?status=${status}`;
  }
  return `/arbitration?folder=${folder.id}`;
}

export function CasesNavGroup({ isCollapsed, onNavigate }: CasesNavGroupProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isGroupActive = isCasesSectionActive(pathname);
  const [open, setOpen] = useState(isGroupActive);
  const { data: folderData } = useFolders();
  const Icon = caseNavGroup.icon;

  const tahkimFolderItems = useMemo(() => {
    return getArbitrationSidebarFolders(folderData ?? []);
  }, [folderData]);

  const generalFolderItems = useMemo(() => {
    return getGeneralSidebarFolders(folderData ?? []);
  }, [folderData]);

  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [isGroupActive]);

  const renderGeneralFolders = (compact = false) =>
    generalFolderItems.map((folder) => {
      const href = generalFolderNavHref(folder);
      const active = isChildActive(pathname, searchParams, href);
      const depth = folder.depth ?? 0;
      return (
        <Link
          key={folder.id}
          href={href}
          onClick={onNavigate}
          title={folder.name}
          className={cn(
            "flex items-center gap-2 rounded-lg py-1.5 text-sm transition-colors",
            depth > 0 ? "ml-3 pl-2" : "px-2",
            compact
              ? "text-foreground hover:bg-slate-50"
              : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white",
            active &&
              (compact
                ? "bg-sidebar-active font-semibold text-white"
                : "border-l-2 border-accent bg-sidebar-active pl-[6px] font-semibold text-white shadow-sm"),
          )}
        >
          <Folder className={cn("h-3.5 w-3.5 shrink-0", active && "text-accent")} />
          <span className="truncate">{folder.name}</span>
        </Link>
      );
    });

  const renderTahkimFolders = (compact = false) =>
    tahkimFolderItems.map((folder) => {
      const href = folderNavHref(folder);
      const active = isChildActive(pathname, searchParams, href);
      const isCaseFolder = Boolean(folder.arbitrationCaseId);
      return (
        <Link
          key={folder.id}
          href={href}
          onClick={onNavigate}
          title={folder.name}
          className={cn(
            "flex items-center gap-2 rounded-lg py-1.5 text-sm transition-colors",
            isCaseFolder ? "ml-3 pl-2" : "px-2",
            !isCaseFolder && "px-2",
            compact
              ? "text-foreground hover:bg-slate-50"
              : "text-sidebar-foreground/85 hover:bg-white/5 hover:text-white",
            active &&
              (compact
                ? "bg-sidebar-active font-semibold text-white"
                : "border-l-2 border-accent bg-sidebar-active pl-[6px] font-semibold text-white shadow-sm"),
          )}
        >
          <Folder className={cn("h-3.5 w-3.5 shrink-0", active && "text-accent")} />
          <span className="truncate">{folder.name}</span>
        </Link>
      );
    });

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/cases"
            onClick={onNavigate}
            className={cn(
              "group flex items-center justify-center rounded-xl px-2 py-2.5 transition-colors duration-200",
              isGroupActive
                ? "bg-sidebar-active text-white"
                : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                isGroupActive ? "text-accent" : "text-sidebar-foreground group-hover:text-white",
              )}
            />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-2 p-2 font-medium">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {caseNavGroup.title}
          </p>
          {caseNavGroup.children.map((child) => {
            const ChildIcon = child.icon;
            const active = isChildActive(pathname, searchParams, child.href);

            return (
              <div key={child.href} className="flex flex-col gap-1">
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-active font-semibold text-white"
                      : "text-foreground hover:bg-slate-50",
                  )}
                >
                  <ChildIcon className={cn("h-3.5 w-3.5", active && "text-accent")} />
                  {child.title}
                </Link>
                {child.href === "/cases" && generalFolderItems.length > 0 && renderGeneralFolders(true)}
                {child.href === "/arbitration" && tahkimFolderItems.length > 0 && renderTahkimFolders(true)}
              </div>
            );
          })}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          "group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
          isGroupActive
            ? "border-l-2 border-accent bg-sidebar-active pl-[10px] text-white"
            : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            isGroupActive ? "text-accent" : "text-sidebar-foreground group-hover:text-white",
          )}
        />
        <span className="truncate">{caseNavGroup.title}</span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180",
            isGroupActive ? "text-accent/80" : "text-sidebar-foreground/70",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-2 flex flex-col gap-2 border-l border-sidebar-foreground/15 pl-4">
              {caseNavGroup.children.map((child) => {
                const ChildIcon = child.icon;
                const active = isChildActive(pathname, searchParams, child.href);

                return (
                  <div key={child.href} className="flex flex-col gap-1">
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors duration-200",
                        active
                          ? "border-l-2 border-accent bg-sidebar-active pl-[6px] font-semibold text-white shadow-sm"
                          : "text-sidebar-foreground/90 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <ChildIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-accent" : "text-sidebar-foreground/70",
                        )}
                      />
                      <span>{child.title}</span>
                    </Link>
                    {child.href === "/cases" && generalFolderItems.length > 0 && (
                      <div className="ml-4 flex flex-col gap-1 border-l border-sidebar-foreground/10 pl-3">
                        {renderGeneralFolders()}
                      </div>
                    )}
                    {child.href === "/arbitration" && tahkimFolderItems.length > 0 && (
                      <div className="ml-4 flex flex-col gap-1 border-l border-sidebar-foreground/10 pl-3">
                        {renderTahkimFolders()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
