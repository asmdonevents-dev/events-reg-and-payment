"use client";

import AppSidebar from "@/components/admin/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "../ui/scroll-area";
import Navbar from "./navbar/navbar";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Sidebar Component goes here */}
      <AppSidebar />

      {/* Main Component goes here */}
      <div className="w-full h-screen overflow-hidden">
        <Navbar />
        <ScrollArea className="h-[calc(100vh-56px)]">
          <div className="p-4 pt-0 md:pr-6 md:pt-1 pb-10 w-screen md:w-full mx-auto">
            {children}
          </div>
        </ScrollArea>
      </div>
    </SidebarProvider>
  );
}
