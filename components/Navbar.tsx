"use strict";
import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="p-2 bg-blue-600 rounded-lg text-white font-bold">JM</span>
              <span className="text-xl font-bold text-slate-800">Job Market Analytics</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/skill-trends"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300"
              >
                Skill Trends
              </Link>
              <Link
                href="/salary-map"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300"
              >
                Salary Map
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300"
              >
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-slate-500">Data updated: Today</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
