import { SignInWithBaseButton } from "@base-org/account-ui/react";
import { motion } from "motion/react";
import Image from "next/image";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";

interface LandingContentProps {
  signInWithBase: () => void;
}

export const LandingContent = ({ signInWithBase }: LandingContentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex justify-center items-center w-full h-screen p-10 bg-[#121314]">
      <div className="flex items-center justify-between w-full h-full px-20 py-5 gap-20 bg-background rounded-[25px]">
        <div className="flex flex-col items-start justify-center w-[40%] gap-10 shrink-0">
          <div className="flex justify-center items-center gap-3">
            <Image
              src="/images/cts_logo.svg"
              alt="The Control The Stream logo"
              width={80}
              height={80}
              priority
            />
            <h1 className="text-[40px] font-bold">ControlTheStream</h1>
          </div>

          <p className="text-6xl text-start leading-tight">
            Take control of your streams with blockchain
          </p>

          <p className="text-lg text-muted text-start leading-relaxed">
            Empower your Twitch and Youtube streams with live tipping, real-time
            polls and on-chain interactions.
          </p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex justify-center items-center gap-3 bg-foreground text-background w-fit py-2.5 px-4.5 rounded-[12px] text-lg font-extrabold cursor-pointer hover:bg-foreground/90"
            onClick={signInWithBase}>
            <div className="size-6 bg-blue-600" />
            Sign in with Base
          </motion.button>
        </div>

        <div className="relative flex justify-center items-center w-full">
          <Image
            src="/images/hero.svg"
            alt="The Control The Stream hero image"
            width={1500}
            height={1500}
            className="object-contain"
          />
          <Image
            src="/images/overlay_popup.gif"
            alt="The Control The Stream overlay popup example"
            width={230}
            height={230}
            className="object-contain absolute -left-10 top-12"
          />
        </div>
      </div>
    </motion.div>
  );
};
