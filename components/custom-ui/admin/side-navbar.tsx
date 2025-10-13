import {
  Bell,
  Blocks,
  ChartBar,
  Images,
  Palette,
  ShieldUser,
} from "lucide-react";
import Image from "next/image";
import { NBButton } from "@/components/custom-ui/nb-button";
import { NBCard } from "@/components/custom-ui/nb-card";
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
    <NBCard className="flex flex-col justify-between items-center h-full w-[264px] bg-warning p-5">
      {/* Top section */}
      <div className="flex flex-col justify-center items-center w-full gap-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full">
          <Image
            src="/images/rollup_logo_white.png"
            alt="rollup whitelabel logo"
            width={160}
            height={33}
            priority
            className="h-auto"
          />
          <ShieldUser className="size-6 text-white" />
        </div>

        {/* Admin buttons */}
        <div className="flex flex-col justify-center items-center w-full gap-2.5">
          <NBButton
            className="w-full"
            variant={isContentBrand ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.BRAND)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentBrand && "text-white",
              )}>
              <Palette className="size-5" />
              <p className="text-xl font-bold">Brand</p>
            </div>
          </NBButton>
          <NBButton
            className="w-full"
            variant={isContentPlugins ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.PLUGINS)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentPlugins && "text-white",
              )}>
              <Blocks className="size-5" />
              <p className="text-xl font-bold">Plugins</p>
            </div>
          </NBButton>
          <NBButton
            className="w-full"
            variant={isContentOverlay ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.OVERLAY)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentOverlay && "text-white",
              )}>
              <Images className="size-5" />
              <p className="text-xl font-bold">Overlay</p>
            </div>
          </NBButton>
          <NBButton
            className="w-full"
            variant={isContentAnalytics ? "default" : "ghost"}
            onClick={() => setSelectedPageContent(AdminPageContent.ANALYTICS)}>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentAnalytics && "text-white",
              )}>
              <ChartBar className="size-5" />
              <p className="text-xl font-bold">Analytics</p>
            </div>
          </NBButton>
          <NBButton
            className="w-full"
            variant={isContentNotifications ? "default" : "ghost"}
            onClick={() =>
              setSelectedPageContent(AdminPageContent.NOTIFICATIONS)
            }>
            <div
              className={cn(
                "flex justify-start items-center w-full gap-2",
                !isContentNotifications && "text-white",
              )}>
              <Bell className="size-5" />
              <p className="text-xl font-bold">Notifications</p>
            </div>
          </NBButton>
        </div>
      </div>

      {/* Logout Button on footer */}
      <LogoutButton executeLogout={executeLogout} />
    </NBCard>
  );
};
