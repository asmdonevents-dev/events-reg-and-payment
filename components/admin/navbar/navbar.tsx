"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import SearchInputComponent from "./search-input";
import AvatarDropdownComponent from "./avatar-dropdown";
import NotificationBtn from "./notification-btn";

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const { toggleSidebar } = useSidebar();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-14 items-center gap-4 bg-card px-4 lg:px-6 border-b border-border">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 flex-1 max-w-sm" />
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 px-4 lg:px-6 border-b border-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-9 w-9 shrink-0"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex-1 min-w-0">
        <SearchInputComponent />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <NotificationBtn />
        <AvatarDropdownComponent />
      </div>
    </header>
  );
};

export default Navbar;
