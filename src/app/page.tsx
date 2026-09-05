"use client";

import Image from "next/image";
import GoogleLoginButton from "./components/GoogleLoginButton/GoogleLoginButton";
import { useEffect, useState } from "react";
import Button from "./components/Button/Button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background text-foreground">
      <main className="flex flex-1 w-full max-w-9/12 flex-col items-center justify-between py-32 px-16 bg-foreground sm:items-start">
          <div className="flex flex-col items-center justify-center gap-4 max-w-1/2 w-full place-self-center">
            <GoogleLoginButton />
          </div>
      </main>
    </div>
  );
}
