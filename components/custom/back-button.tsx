"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const BackButton = ({ label, href }: { label?: string; href?: string }) => {
  const router = useRouter();
  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };
  return (
    <Button variant="ghost" onClick={handleBack} className="gap-2">
      <ArrowLeft className="h-4 w-4" />
      Back {label ? `to ${label}` : ""}
    </Button>
  );
};

export default BackButton;
