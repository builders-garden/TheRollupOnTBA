import { motion } from "motion/react";

interface ErrorPageProps {
  errorMessage: string;
}

export default function ErrorPage({ errorMessage }: ErrorPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center h-full w-full gap-2 text-center px-5">
        <h1 className="text-2xl font-bold text-black">
          An error occurred, please try again later.
        </h1>
        <p className="text-gray-500 break-words max-w-[300px]">
          {errorMessage}
        </p>
      </div>
    </motion.div>
  );
}
