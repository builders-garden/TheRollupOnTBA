"use client";

import {
  UnderlinedTabsContent,
  UnderlinedTabsList,
  UnderlinedTabsTrigger,
  UnderlinedTabsWithQueryState,
} from "@/components/ui/tabs";
import { useApp } from "@/contexts/app-context";
import { ProfileHeader } from "./profile-header";

export const ProfilePage = () => {
  const { activeProfile } = useApp();

  return (
    <div className="relative flex flex-col items-center justify-center w-full px-2">
      <ProfileHeader user={activeProfile} />

      {/* User stats and activity */}
      <UnderlinedTabsWithQueryState
        queryKey="profile"
        defaultValue="tab1"
        className="w-full mb-4">
        <UnderlinedTabsList className="w-full flex justify-between">
          <UnderlinedTabsTrigger value="tab1" className="w-full">
            Tab1
          </UnderlinedTabsTrigger>
          <UnderlinedTabsTrigger value="tab2" className="w-full">
            Tab2
          </UnderlinedTabsTrigger>
        </UnderlinedTabsList>
        <UnderlinedTabsContent value="tab1" className="my-4">
          Tab 1
        </UnderlinedTabsContent>
        <UnderlinedTabsContent value="tab2" className="my-4">
          Tab 2
        </UnderlinedTabsContent>
      </UnderlinedTabsWithQueryState>
    </div>
  );
};
