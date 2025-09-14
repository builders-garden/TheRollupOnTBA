import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NBButton } from "../nb-button";
import { useSubscribeNewsletter } from "@/hooks/use-subscribe-newsletter";
import { toast } from "sonner";

interface NewsletterCTAProps {
  label: string;
}

export const NewsletterCTA = ({ label }: NewsletterCTAProps) => {
  const { mutate: subscribe, isPending } = useSubscribeNewsletter();
  const [editingValue, setEditingValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = () => {
    subscribe({ email: editingValue }, {
      onSuccess: () => {
        setEditingValue("");
        toast.success("Subscribed to newsletter");
        setIsEditing(false);
      },
      onError: () => {
        toast.error("Request failed: your email is already registered to this newsletter or is invalid!");
        setIsEditing(false);
      },
    });
  };

  return (
    <div className="flex flex-col justify-center items-start w-full gap-2.5">
      <h1 className="text-sm font-bold">{label}</h1>
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
        <NBButton
          className="bg-accent w-fit"
          disabled={editingValue === "" || isPending}
          onClick={handleSubscribe}>
          <p className="text-base font-extrabold text-white">
            {isPending ? "Subscribing..." : "Subscribe"}
          </p>
        </NBButton>
      </div>
    </div>
  );
};
