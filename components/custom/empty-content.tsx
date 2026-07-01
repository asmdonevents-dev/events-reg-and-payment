import { cn } from "@/lib/utils";

export function EmptyContentComponent({
  icon,
  label,
  description,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-muted-foreground/40">{icon}</div> : null}
      <p className="font-medium text-foreground">{label}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
