"use client";

import { BellIcon, CalendarCheck2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotificationBtn() {
  const pendingComments = 0;
  const pendingDemos = 0;

  const total = pendingComments + pendingDemos;

  const items = [
    {
      label: "Pending blog comments",
      count: pendingComments,
      href: "/admin/comments",
      icon: MessageSquare,
    },
    {
      label: "Pending demo requests",
      count: pendingDemos,
      href: "/admin/demo-requests",
      icon: CalendarCheck2,
    },
  ].filter((item) => item.count > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Admin notifications">
          <div className="relative">
            <BellIcon
              size={16}
              aria-hidden="true"
              className="dark:text-primary"
            />
            {total > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 left-full h-4 min-w-4 -translate-x-1/2 px-1 text-[10px]"
              >
                {total > 99 ? "99+" : total}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Needs attention</span>
          {total > 0 && <Badge variant="secondary">{total} pending</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length > 0 ? (
          items.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="flex-1">{item.label}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </Link>
              </DropdownMenuItem>
            );
          })
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>All caught up — nothing pending.</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
