import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { cn } from "@/lib/utils";

interface BullmeterProps {
  showLabel?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  title: string;
  timeLeft: string;
  button1text: string;
  button2text: string;
  button1Color?: string;
  button2Color?: string;
  button1OnClick?: () => void;
  button2OnClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  button1Loading?: boolean;
  button2Loading?: boolean;
}

export const Bullmeter = ({
  showLabel = true,
  label = "Bull-meter",
  className,
  cardClassName,
  title,
  timeLeft,
  button1text,
  button2text,
  button1Color,
  button2Color,
  button1OnClick,
  button2OnClick,
  disabled = false,
  loading = false,
  button1Loading = false,
  button2Loading = false,
}: BullmeterProps) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-start w-full gap-2.5",
        className,
      )}>
      {showLabel && <h1 className="text-sm font-bold">{label}</h1>}
      <NBCard className={cn("w-full items-start gap-2.5", cardClassName)}>
        <div className="flex flex-col justify-center items-start">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex justify-start items-center gap-1.5">
            <div className="size-2 bg-[#41CB6E] rounded-full animate-pulse animate-infinite animate-ease-linear" />
            <p className="text-sm font-medium">{timeLeft} left to vote</p>
          </div>
        </div>

        <div className="flex justify-between items-center w-full gap-2.5">
          {/* Button 1 */}
          <NBButton
            onClick={button1OnClick}
            disabled={disabled || loading || button1Loading}
            className={`bg-${button1Color} w-full h-[50px]`}>
            <AnimatePresence mode="wait">
              {button1Loading ? (
                <motion.div
                  key="button1-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-white animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="button1-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-white text-2xl font-extrabold">
                    {button1text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </NBButton>
          {/* Button 2 */}
          <NBButton
            onClick={button2OnClick}
            disabled={disabled || loading || button2Loading}
            className={`bg-${button2Color} w-full h-[50px]`}>
            <AnimatePresence mode="wait">
              {button2Loading ? (
                <motion.div
                  key="button2-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <Loader2 className="size-5 text-white animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="button2-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}>
                  <p className="text-white text-2xl font-extrabold">
                    {button2text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </NBButton>
        </div>
      </NBCard>
    </div>
  );
};
