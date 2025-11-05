"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default to collapsed for auto-collapse behavior
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load saved state from localStorage after component mounts
  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    } else {
      // If no saved state, default to collapsed
      setIsCollapsed(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
