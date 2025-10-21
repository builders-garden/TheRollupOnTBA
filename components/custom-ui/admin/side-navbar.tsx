import {
  Bell,
  Blocks,
  ChartBar,
  Images,
  Palette,
  ShieldUser,
} from "lucide-react";
import Image from "next/image";
import { CTSButton } from "@/components/custom-ui/cts-button";
import { CTSCard } from "@/components/custom-ui/cts-card";
import { useAdminAuth } from "@/contexts/auth/admin-auth-context";
import { AdminPageContent } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { LogoutButton } from "../logout-button";

interface SideNavbarProps {
  selectedPageContent: AdminPageContent;
  setSelectedPageContent: (pageContent: AdminPageContent) => void;
}

export const SideNavbar = ({
  selectedPageContent,
  setSelectedPageContent,
}: SideNavbarProps) => {
  const { executeLogout } = useAdminAuth();

  // Whether the page content is plugins, overlay, brand, analytics or notifications
  const isContentPlugins = selectedPageContent === AdminPageContent.PLUGINS;
  const isContentOverlay = selectedPageContent === AdminPageContent.OVERLAY;
  const isContentBrand = selectedPageContent === AdminPageContent.BRAND;
  const isContentAnalytics = selectedPageContent === AdminPageContent.ANALYTICS;
  const isContentNotifications =
    selectedPageContent === AdminPageContent.NOTIFICATIONS;

  return (
    <CTSCard className="flex flex-col justify-between items-center h-full w-[264px] bg-card p-5">
      {/* Top section */}
      <div className="flex flex-col justify-center items-center w-full gap-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <Image
            src="/images/cts_logo.svg"
            alt="The Control The Stream logo"
            width={50}
            height={33}
            priority
            className="h-auto"
          />
          <ShieldUser className="size-6 text-foreground" />
        </div>

        {/* Admin buttons */}
        <div className="flex flex-col justify-center items-center w-full gap-2.5">
          <CTSButton
            className="w-full bg-foreground"
            variant={isContentBrand ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.BRAND)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentBrand && "text-foreground",
              )}>
              <Palette className="size-5" />
              <p className="text-xl font-bold">Brand</p>
            </div>
          </CTSButton>
          <CTSButton
            className="w-full bg-foreground"
            variant={isContentPlugins ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.PLUGINS)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentPlugins && "text-foreground",
              )}>
              <Blocks className="size-5" />
              <p className="text-xl font-bold">Plugins</p>
            </div>
          </CTSButton>
          <CTSButton
            className="w-full bg-foreground"
            variant={isContentOverlay ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.OVERLAY)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentOverlay && "text-foreground",
              )}>
              <Images className="size-5" />
              <p className="text-xl font-bold">Overlay</p>
            </div>
          </CTSButton>
          <CTSButton
            className="w-full bg-foreground"
            variant={isContentAnalytics ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.ANALYTICS)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentAnalytics && "text-foreground",
              )}>
              <ChartBar className="size-5" />
              <p className="text-xl font-bold">Analytics</p>
            </div>
          </CTSButton>
          <CTSButton
            className="w-full bg-foreground"
            variant={isContentNotifications ? "default" : "ghost"}
            onClick={() =>
              setSelectedPageContent(AdminPageContent.NOTIFICATIONS)
            }>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentNotifications && "text-foreground",
              )}>
              <Bell className="size-5" />
              <p className="text-xl font-bold">Notifications</p>
            </div>
          </CTSButton>
        </div>
      </div>

      {/* Logout Button on footer */}
      <LogoutButton executeLogout={executeLogout} />
    </CTSCard>
  );
};
