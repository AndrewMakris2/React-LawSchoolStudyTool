import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border border-gray-800 rounded-xl p-5 ${
        onClick ? "cursor-pointer hover:border-law-700 transition-colors" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-semibold text-gray-100 ${className}`}>{children}</h3>;
}
