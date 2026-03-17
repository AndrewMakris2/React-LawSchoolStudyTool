import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  onClearKey?: () => void;
}

export function Layout({ onClearKey }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar onClearKey={onClearKey} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
