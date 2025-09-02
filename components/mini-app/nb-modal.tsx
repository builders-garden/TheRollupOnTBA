import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";

interface NBModalProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  contentClassName?: string;
}

export const NBModal = ({
  trigger,
  children,
  isOpen,
  setIsOpen,
  contentClassName,
}: NBModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          contentClassName,
        )}
        showCloseButton={false}>
        <DialogHeader className="hidden">
          <DialogTitle />
          <DialogDescription />
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
