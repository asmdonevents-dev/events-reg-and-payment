"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQueryClient } from "react-query";
import { toast } from "sonner";
import { DialogModal } from "@/components/custom/custom-modal";
import { logoutAdmin } from "@/data/admin-auth";

type LogoutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LogoutModal = ({ open, onOpenChange }: LogoutModalProps) => {
  const [submitting, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const result = await logoutAdmin();
        if (!result.success) {
          toast.error("Failed to log out");
          return;
        }
        queryClient.clear();
        toast.success("Logged out successfully.");
        router.push("/admin/auth/login");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Failed to log out. Please try again.");
      } finally {
        onOpenChange(false);
      }
    });
  };

  return (
    <DialogModal
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out of Admin Portal?"
      description="You will need to sign in again to access the admin dashboard."
      showFooter
      saveLabel={submitting ? "Signing out…" : "Sign out"}
      cancelLabel="Cancel"
      saveVariant="destructive"
      saveDisabled={submitting}
      onSave={handleLogout}
    />
  );
};

export default LogoutModal;
