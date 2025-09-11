import { NBCard } from "../nb-card";

interface BottomNavbarProps {
  userProfilePicture: string;
}

export const BottomNavbar = ({ userProfilePicture }: BottomNavbarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-transparent px-5 pb-5 pt-3 transition-all duration-300">
      <div className="flex justify-between items-center w-full">
        <NBCard className="rounded-full py-1 w-[106px] shrink-0">
          <div className="flex justify-center items-center w-full gap-1.5">
            {userProfilePicture ? (
              <img
                src={userProfilePicture}
                alt="User profile picture"
                className="size-[24px] bg-warning rounded-full border border-black"
              />
            ) : (
              <div className="size-[24px] bg-warning rounded-full border border-black" />
            )}
            <p className="text-xl font-bold">$5.76</p>
          </div>
        </NBCard>
      </div>
    </nav>
  );
};
