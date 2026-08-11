import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  Moon,
  Search,
  ChevronDown,
} from "lucide-react";

import { toast } from "sonner";

import { useAuthContext } from "@/contexts/AuthContext";

export default function Topbar() {
  const { logout } = useAuthContext();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();

    setOpen(false);

    toast.success("Logged out successfully.");

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-[#262B34] bg-[#111417] px-8">

      {/* Search */}

      <div className="relative w-[420px]">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B949E]"
        />

        <input
          placeholder="Search drivers, routes, warehouses..."
          className="h-11 w-full rounded-xl border border-[#2A2F36] bg-[#1B1F23] pl-11 pr-4 text-sm text-white outline-none transition-all focus:border-[#3B82F6]"
        />

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-4">

        {/* Notifications */}

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2F36] bg-[#1B1F23] text-white transition hover:bg-[#252A31]"
        >
          <Bell size={18} />
        </button>

        {/* Theme */}

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A2F36] bg-[#1B1F23] text-white transition hover:bg-[#252A31]"
        >
          <Moon size={18} />
        </button>

        {/* User Menu */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            className="flex items-center gap-3 rounded-xl border border-[#2A2F36] bg-[#1B1F23] px-3 py-2 text-white transition hover:bg-[#252A31]"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-semibold">
              H
            </div>

            <div className="text-left">

              <p className="text-sm font-medium">
                Harsha
              </p>

              <p className="text-xs text-[#8B949E]">
                Admin
              </p>

            </div>

            <ChevronDown
              size={16}
              className={`transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />

          </button>

          {/* Dropdown */}

          {open && (
            <div className="absolute right-0 top-14 z-50 w-48 rounded-xl border border-[#2A2F36] bg-[#171B22] p-2 shadow-xl">

              <div className="border-b border-[#2A2F36] px-3 py-2">

                <p className="text-sm font-medium text-white">
                  Harsha
                </p>

                <p className="text-xs text-[#8B949E]">
                  Administrator
                </p>

              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}