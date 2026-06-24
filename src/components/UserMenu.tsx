"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  name: string;
  image?: string;
}

export function UserMenu({ name, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Clickable Profile Area */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <span className="text-sm hidden sm:inline">{name}</span>
        <span className="text-sm sm:hidden">{name?.split(' ')[0]}</span>
        {image ? (
          <img src={image} alt="Profile" className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/20" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/20 bg-[#E0C58F] text-[#173450] flex items-center justify-center font-bold text-base md:text-lg">
            {name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        {/* Small dropdown arrow */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 text-[#998f88] transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-panel border border-white/10 rounded-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm text-white font-medium truncate">{name}</p>
            <p className="text-xs text-[#998f88] mt-0.5">Google Account</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
