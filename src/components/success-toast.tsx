import { CheckCircle2 } from "lucide-react";

export function SuccessToast({ message }: { message: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-emerald-300 bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/30 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-emerald-200 dark:bg-emerald-900/50 p-1">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
          {message}
        </p>
      </div>
    </div>
  );
} 