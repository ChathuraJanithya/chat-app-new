"use client";

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

function SidebarProvider({
  children,
  defaultIsOpen = true,
}: {
  children: React.ReactNode;
  defaultIsOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

const sidebarVariants = cva(
  "h-screen flex flex-col bg-sidebar-background text-sidebar-foreground border-r transition-all duration-300 ease-in-out",
  {
    variants: {
      isOpen: {
        true: "w-[280px] md:w-[280px]",
        false: "w-0 md:w-0",
      },
    },
    defaultVariants: {
      isOpen: true,
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

function Sidebar({ className, ...props }: SidebarProps) {
  const { isOpen } = useSidebarContext();

  return (
    <div
      className={cn(sidebarVariants({ isOpen }), className)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    />
  );
}

function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-2", className)} {...props} />;
}

function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto", className)} {...props} />;
}

function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />;
}

function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

function SidebarMenuItem({
  onClick,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div onClick={onClick} className={cn("px-2", className)} {...props} />;
}

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  asChild?: boolean;
  onClick?: () => void;
}

function SidebarMenuButton({
  children,
  isActive,
  asChild = false,
  onClick,
}: SidebarMenuButtonProps) {
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button
      className={cn(
        "w-full",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SidebarTrigger() {
  const { isOpen, setIsOpen } = useSidebarContext();

  return (
    <button
      className="mr-2 h-9 w-9 rounded-md p-2 hover:bg-accent"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarProvider,
  useSidebarContext,
};
