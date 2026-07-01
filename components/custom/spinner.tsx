import { cn } from "@/lib/utils";

export function ButtonSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        )}
      />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
