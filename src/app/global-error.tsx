"use client";

import { Button } from "@/components/ui/button";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("global error", error);
  const resetHandler = () => {
    console.log("Attempting to recover from error");
    reset();
  };

  const handleRefresh = () => {
    console.log("Refreshing the page");
    window.location.reload();
  };

  return (
    <html lang="en">
      <body
        className={`text-white bg-black min-h-screen flex flex-col p-4 pt-0`}>
        <div className="flex-1 border-red-950/50 border-solid">
          <div>
            <h2 className="mb-8">{"Something went wrong!"}</h2>
            <div className="flex items-center gap-4">
              <Button
                onClick={resetHandler}
                className="bg-zinc-50 w-fit text-black font-semibold rounded px-4 py-2 hover:bg-zinc-100 focus-within:bg-zinc-300 transition">
                Try again
              </Button>
              <div className="flex items-center gap-1">
                <span className="bg-white/20 block h-px w-2"></span>
                <span className="text-sm text-white/70">or</span>
                <span className="bg-white/20 block h-px w-2"></span>
              </div>
              <Button
                onClick={handleRefresh}
                className="bg-transparent shadow-[inset_0_0_0_2px] shadow-white w-fit text-white font-semibold rounded px-4 py-2 hover:bg-white/10 focus-within:bg-white/20 transition">
                Reload the page
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
