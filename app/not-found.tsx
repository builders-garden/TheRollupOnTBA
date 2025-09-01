"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

// TODO: Redo this page with the new style
export default function NotFound(): React.JSX.Element {
  const router = useRouter();

  const handleGoBack = (): void => {
    router.back();
  };
  const handleBackToHome = (): void => {
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col py-32 items-center justify-center text-center">
        <span className="text-[10rem] font-semibold leading-none">404</span>
        <h2 className="font-heading my-2 text-2xl font-bold">
          Something&apos;s missing
        </h2>
        <p>
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <button onClick={handleGoBack}>Go back</button>
          <button onClick={handleBackToHome}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}
