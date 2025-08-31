"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useApp } from "@/contexts/app-context";
import { PageContent } from "@/types";
import { UserProfile } from "./user-profile";

export const Navbar = () => {
  const { handlePageChange } = useApp();

  return (
    <motion.header
      id="navbar"
      className="flex justify-between items-center w-full px-2 text-white z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <div
        className="flex items-center justify-start w-fit cursor-pointer text-black"
        onClick={() => handlePageChange(PageContent.HOME)}>
        <Image
          src="/images/icon.png"
          width={30}
          height={30}
          className="w-10 h-10 p-1"
          alt="logo"
        />
        <span className="text-xl font-bold" style={{ fontWeight: 500 }}>
          Starter
        </span>
      </div>

      <UserProfile />
    </motion.header>
  );
};
