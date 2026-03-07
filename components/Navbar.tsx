"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/skill-trends", label: "Skill Trends" },
  { href: "/salary-map", label: "Salary Map" },
  { href: "/about", label: "About" },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center">
            <span className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded text-white text-[10px] font-bold flex-shrink-0">
              JM
            </span>
            <span className="ml-2 text-sm font-semibold text-slate-800 whitespace-nowrap">
              Job Market Analytics
            </span>
            <span className="mx-3 h-3.5 w-px bg-slate-300 flex-shrink-0" />
            <div className="flex items-center gap-0.5">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-blue-500" />
                    )}
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
