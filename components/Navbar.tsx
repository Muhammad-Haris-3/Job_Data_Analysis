"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Activity } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/skill-trends", label: "Skill Trends" },
    { href: "/salary-map", label: "Salary Map" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "linear-gradient(135deg, #0a0e1a 0%, #0d1424 100%)",
        borderColor: "#1e3a5f",
        boxShadow: "0 1px 0 rgba(0, 212, 255, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, #00d4ff22 0%, #00ff8822 100%)",
                border: "1px solid #00d4ff44",
              }}
            >
              <BarChart2 className="w-5 h-5" style={{ color: "#00d4ff" }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight">
                JobMarket
              </span>
              <span
                className="font-bold text-base tracking-tight"
                style={{ color: "#00d4ff" }}
              >
                .ai
              </span>
              <div
                className="text-xs"
                style={{
                  color: "#4a6fa5",
                  fontFamily: "monospace",
                  lineHeight: 1,
                }}
              >
                DS Analytics Platform
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
                  style={{
                    color: active ? "#00d4ff" : "#8ba3c7",
                    background: active
                      ? "rgba(0, 212, 255, 0.08)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(0, 212, 255, 0.2)"
                      : "1px solid transparent",
                  }}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "#00d4ff" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right — live clock */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid #1e3a5f",
              fontFamily: "monospace",
            }}
          >
            <Activity className="w-3 h-3 text-green-400" />
            <span className="text-xs" style={{ color: "#4a6fa5" }}>
              LIVE
            </span>
            <span className="text-xs text-white">{time}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
