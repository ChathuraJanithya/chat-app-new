"use client";

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { LogIn } from "lucide-react";

export function AnonymousChatHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link
          href="https://visitsrilanka.ai/"
          className="flex items-center gap-2 font-semibold"
          target="_blank"
        >
          <Image
            src="/visitSriLanka.png"
            alt="Visit Sri Lanka"
            width={32}
            height={32}
          />
          <span>Visit Sri Lanka</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
