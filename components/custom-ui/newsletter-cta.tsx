import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSubscribeNewsletter } from "@/hooks/use-subscribe-newsletter";
import { AuthTokenType } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { CTSButton } from "./cts-button";

interface NewsletterCTAProps {
  label: string;
  labelClassName?: string;
  className?: string;
}

export const NewsletterCTA = ({
  label,
  labelClassName,
  className,
}: NewsletterCTAProps) => {
  const { mutate: subscribe, isPending } = useSubscribeNewsletter(
    AuthTokenType.MINI_APP_AUTH_TOKEN,
  );
  const [editingValue, setEditingValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = () => {
    subscribe(
      { email: editingValue },
      {
        onSuccess: () => {
          setEditingValue("");
          toast.success("Subscribed to newsletter");
          setIsEditing(false);
        },
        onError: () => {
          toast.error(
            "Request failed: your email is already registered to this newsletter or is invalid!",
          );
          setIsEditing(false);
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-center items-start w-full gap-2.5",
        className,
      )}>
      <h1 className={cn("text-sm font-bold", labelClassName)}>{label}</h1>
      <div className="flex justify-between items-center gap-2.5 w-full">
        <div
          className={cn(
            "flex w-full justify-start items-center gap-2.5 rounded-[12px] border-accent border-[1px] ring-accent/40 px-5 py-2.5 bg-white transition-all duration-300",
            isEditing && "ring-[2px]",
          )}>
          <input
            ref={inputRef}
            type="text"
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="johndoe@example.com"
            className="w-full h-full outline-none focus:ring-none focus:ring-0 focus:border-none text-base"
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value);
            }}
          />
        </div>
        <CTSButton
          className="bg-accent w-fit"
          disabled={editingValue === "" || isPending}
          onClick={handleSubscribe}>
          <p className="text-base font-extrabold text-foreground">
            {isPending ? "Subscribing..." : "Subscribe"}
          </p>
        </CTSButton>
      </div>
    </div>
  );
};
