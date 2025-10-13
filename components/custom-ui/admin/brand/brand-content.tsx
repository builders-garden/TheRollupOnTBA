import { Sparkle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { BrandTabs } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { NBButton } from "../../nb-button";
import { AccessContent } from "./access/access-content";
import { HostsContent } from "./hosts/hosts-content";
import { InfoContent } from "./info/info-content";

export const BrandContent = () => {
  // Brand tabs states
  const [selectedTab, setSelectedTab] = useState<BrandTabs>(BrandTabs.INFO);

  // Whether the tab is info, access, or hosts
  const isInfoTab = selectedTab === BrandTabs.INFO;
  const isAccessTab = selectedTab === BrandTabs.ACCESS;
  const isHostsTab = selectedTab === BrandTabs.HOSTS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col justify-start items-center w-full">
      {/* Tabs Buttons */}
      <div className="flex justify-start items-center w-full py-5 px-2.5 gap-5 border-b-[1px] border-border">
        <NBButton
          className={cn("rounded-full w-fit", isInfoTab && "bg-accent")}
          variant={isInfoTab ? "default" : "outline"}
          showShadow={isInfoTab}
          onClick={() => setSelectedTab(BrandTabs.INFO)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isInfoTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Info</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isAccessTab && "bg-accent")}
          variant={isAccessTab ? "default" : "outline"}
          showShadow={isAccessTab}
          onClick={() => setSelectedTab(BrandTabs.ACCESS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isAccessTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Access</p>
          </div>
        </NBButton>
        <NBButton
          className={cn("rounded-full w-fit", isHostsTab && "bg-accent")}
          variant={isHostsTab ? "default" : "outline"}
          showShadow={isHostsTab}
          onClick={() => setSelectedTab(BrandTabs.HOSTS)}>
          <div
            className={cn(
              "flex justify-start items-center w-full gap-2",
              isHostsTab && "text-white",
            )}>
            <Sparkle className="size-6" />
            <p className="text-xl font-bold">Hosts</p>
          </div>
        </NBButton>
      </div>

      {/* Brand Content */}
      <AnimatePresence mode="wait">
        {isInfoTab && <InfoContent key="info" />}
        {isAccessTab && <AccessContent key="access" />}
        {isHostsTab && <HostsContent key="hosts" />}
      </AnimatePresence>
    </motion.div>
  );
};
