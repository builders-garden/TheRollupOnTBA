import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface WebAppBullmeterProps {
  showLabel?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  title: string;
  timeLeft: string;
  votePrice: number;
  deadlineSeconds?: number;
  button1text: string;
  button2text: string;
  button1Color?: string;
  button2Color?: string;
  button1OnClick?: (votesNumber: number) => void;
  button2OnClick?: (votesNumber: number) => void;
  disabled?: boolean;
  loading?: boolean;
  button1Loading?: boolean;
  button2Loading?: boolean;
}

export const WebAppBullmeter = ({
  showLabel = true,
  label = "Bull-meter",
  className,
  cardClassName,
  title,
  timeLeft,
  votePrice,
  deadlineSeconds,
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
}: WebAppBullmeterProps) => {
  const [button1VotesNumber, setButton1VotesNumber] = useState<number>(0);
  const [button2VotesNumber, setButton2VotesNumber] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);

  // The maximum number of votes
  const MAX_VOTES = 100;

  // Whether the poll has expired
  const isExpired =
    typeof deadlineSeconds === "number"
      ? deadlineSeconds - Math.floor(Date.now() / 1000) <= 0
      : false;

  // Debounce the votes number in order to avoid sending the vote to the
  // smart contract multiple times
  const debouncedButton1VotesNumber = useDebounce(button1VotesNumber, 1500);
  const debouncedButton2VotesNumber = useDebounce(button2VotesNumber, 1500);

  // When the debounced votes number changes, send the smart contract the vote
  useEffect(() => {
    const sendVote = async () => {
      if (debouncedButton1VotesNumber > 0) {
        // Call the button1OnClick function
        button1OnClick?.(debouncedButton1VotesNumber);
        setTotalVotes(totalVotes + debouncedButton1VotesNumber);
        setButton1VotesNumber(0);
      } else if (debouncedButton2VotesNumber > 0) {
        // Call the button2OnClick function
        button2OnClick?.(debouncedButton2VotesNumber);
        setTotalVotes(totalVotes + debouncedButton2VotesNumber);
        setButton2VotesNumber(0);
      }
    };

    sendVote();
  }, [debouncedButton1VotesNumber, debouncedButton2VotesNumber]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "flex flex-col justify-center items-start w-full gap-2.5",
        className,
      )}>
      {showLabel && <h1 className="text-2xl font-bold">{label}</h1>}
      <NBCard className={cn("w-full items-start gap-2.5", cardClassName)}>
        <div className="flex flex-col justify-center items-start gap-1.5">
          <h1 className="text-2xl font-bold leading-7">{title}</h1>
          <div className="flex justify-start items-center gap-1.5">
            <div
              className={`size-2.5 rounded-full ${
                isExpired
                  ? "bg-yellow-500"
                  : "bg-green-500 animate-pulse animate-infinite animate-ease-linear"
              }`}
            />
            <p className="text-base font-medium">
              {isExpired
                ? "vote ended"
                : `${timeLeft} left to vote • $${votePrice} per vote`}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center w-full gap-2.5">
          {/* Button 1 */}
          <NBButton
            onClick={() => {
              if (
                button1VotesNumber >= MAX_VOTES - totalVotes ||
                isExpired ||
                disabled ||
                loading ||
                button1Loading
              )
                return;

              if (button2VotesNumber > 0) {
                // Reset the button2 votes number
                setButton2VotesNumber(0);
              }

              // Increment the button1 votes number
              setButton1VotesNumber(button1VotesNumber + 1);
            }}
            disabled={
              disabled ||
              loading ||
              button1Loading ||
              isExpired ||
              button1VotesNumber >= MAX_VOTES - totalVotes ||
              button2VotesNumber >= MAX_VOTES - totalVotes
            }
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
            onClick={() => {
              if (
                button2VotesNumber >= MAX_VOTES - totalVotes ||
                isExpired ||
                disabled ||
                loading ||
                button2Loading
              )
                return;

              if (button1VotesNumber > 0) {
                // Reset the button1 votes number
                setButton1VotesNumber(0);
              }

              // Increment the button2 votes number
              setButton2VotesNumber(button2VotesNumber + 1);
            }}
            disabled={
              disabled ||
              loading ||
              button2Loading ||
              isExpired ||
              button2VotesNumber >= MAX_VOTES - totalVotes ||
              button1VotesNumber >= MAX_VOTES - totalVotes
            }
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
    </motion.div>
  );
};
