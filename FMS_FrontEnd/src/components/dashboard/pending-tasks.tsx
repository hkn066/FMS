"use client";

import { AlertCircle, Clock } from "lucide-react";
import type { Task } from "@/types";
import { PRIORITY_LEVELS } from "@/constants/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewAllLink } from "@/components/dashboard/view-all-link";
import { cn, formatDate } from "@/lib/utils";

const TASK_LIMIT = 4;

const priorityBadgeClasses: Record<Task["priority"], string> = {
  low: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400",
  medium:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
  high: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-400",
  urgent: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400",
};

interface PendingTasksProps {
  tasks: Task[];
  limit?: number;
  showViewAll?: boolean;
}

export function PendingTasks({ tasks, limit = TASK_LIMIT, showViewAll = true }: PendingTasksProps) {
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const displayedTasks = pendingTasks.slice(0, limit);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Bekleyen Görevler</CardTitle>
          <Badge variant="secondary" className="border-slate-200 bg-slate-50 text-slate-600">
            {pendingTasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedTasks.length === 0 ? (
          <p className="text-sm text-slate-500">Bekleyen görev bulunmuyor.</p>
        ) : (
          displayedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-border dark:hover:bg-muted/50"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  task.priority === "urgent"
                    ? "bg-rose-50 dark:bg-rose-950/30"
                    : "bg-slate-50 dark:bg-slate-800/50",
                )}
              >
                {task.priority === "urgent" ? (
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                ) : (
                  <Clock className="h-4 w-4 text-slate-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span>{task.assignee}</span>
                  <span>•</span>
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>
              <Badge variant="outline" className={priorityBadgeClasses[task.priority]}>
                {PRIORITY_LEVELS[task.priority].label}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
      {showViewAll && (
        <CardFooter className="pt-0">
          <ViewAllLink href="/tasks" />
        </CardFooter>
      )}
    </Card>
  );
}
