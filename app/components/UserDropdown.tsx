"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

interface UserDropdownProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-secondary transition-all"
        aria-label="เมนูผู้ใช้"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-outline-variant">
            <p className="text-sm font-semibold text-on-surface truncate">
              {user.name}
            </p>
            <p className="text-xs text-on-surface-variant truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                receipt_long
              </span>
              คำสั่งซื้อของฉัน
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  admin_panel_settings
                </span>
                แผงควบคุม Admin
              </Link>
            )}
          </div>

          <div className="border-t border-outline-variant py-1">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  logout
                </span>
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
