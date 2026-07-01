import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDirection } from "@radix-ui/react-direction";

type ModalControlProps = {
  open: boolean;
  setOpen?: (open: boolean) => void;
  onOpenChange?: (open: boolean) => void;
};

type DialogModalProps = ModalControlProps & {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  showFooter?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveVariant?: "primary" | "destructive" | "outline";
  saveDisabled?: boolean;
  closeOnOverlayClick?: boolean;
  overlay?: boolean;
  maxWidth?: string;
};

function useModalControl({
  setOpen,
  onOpenChange,
}: Pick<ModalControlProps, "setOpen" | "onOpenChange">) {
  return { handleOpenChange: setOpen ?? onOpenChange ?? (() => {}) };
}

export function DialogModal({
  open,
  setOpen,
  onOpenChange,
  title,
  description,
  children,
  showFooter = false,
  onSave,
  onCancel,
  saveLabel = "Save changes",
  cancelLabel = "Cancel",
  saveVariant = "primary",
  saveDisabled = false,
  closeOnOverlayClick = true,
  overlay = true,
  maxWidth = "sm:max-w-lg",
}: DialogModalProps) {
  const direction = useDirection();
  const { handleOpenChange } = useModalControl({ setOpen, onOpenChange });

  const handleSave = () => {
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={maxWidth}
        overlay={overlay}
        dir={direction}
        onPointerDownOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="pt-4 text-center">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-center">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="grid gap-4 py-2">{children}</div>

        {showFooter ? (
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={saveVariant}
              onClick={handleSave}
              disabled={saveDisabled}
            >
              {saveLabel}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type ScrollableDialogModalProps = ModalControlProps & {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  showFooter?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveVariant?: "primary" | "destructive" | "outline";
  saveDisabled?: boolean;
  closeOnOverlayClick?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  scrollHeight?: string;
  overlay?: boolean;
};

export function ScrollableDialogModal({
  open,
  setOpen,
  onOpenChange,
  title,
  description,
  children,
  showFooter = false,
  onSave,
  onCancel,
  saveLabel = "Ok",
  cancelLabel = "Cancel",
  saveVariant = "primary",
  saveDisabled = false,
  closeOnOverlayClick = true,
  maxWidth = "sm:max-w-lg",
  maxHeight = "sm:max-h-[min(650px,90vh)]",
  scrollHeight = "max-h-[400px]",
  overlay = true,
}: ScrollableDialogModalProps) {
  const direction = useDirection();
  const { handleOpenChange } = useModalControl({ setOpen, onOpenChange });

  const handleSave = () => {
    onSave?.();
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`p-0 ${maxWidth} ${maxHeight}`}
        overlay={overlay}
        dir={direction}
        onPointerDownOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className="m-0 border-b border-border pb-3 pt-5">
          <DialogTitle className="px-6 text-base">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="px-6">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <ScrollArea
          viewportClassName={scrollHeight}
          className="my-3 ps-6 pe-5 me-1 text-sm"
        >
          <div>{children}</div>
        </ScrollArea>
        {showFooter ? (
          <DialogFooter className="border-t border-border px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant={saveVariant}
              onClick={handleSave}
              disabled={saveDisabled}
            >
              {saveLabel}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default ScrollableDialogModal;
