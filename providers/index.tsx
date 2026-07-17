"use client";
import React from "react";
import { ReactQueryProvider } from "./react-query";
import { ThemeProvider } from "./theme";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </ReactQueryProvider>
  );
};

export default Providers;
