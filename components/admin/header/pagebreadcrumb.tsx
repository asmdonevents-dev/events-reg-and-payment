"use client";

import { usePathname } from "next/navigation";

function titleFromSegment(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PageBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);

  return (
    <nav className="text-sm text-muted-foreground">
      Admin {segments.length ? " / " : ""}
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`}>
          {index > 0 ? " / " : ""}
          {titleFromSegment(segment)}
        </span>
      ))}
    </nav>
  );
}
