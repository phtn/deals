"use client";
import { useAuthCtx } from "@/ctx/auth";
import {
  BotOff,
  DollarSign,
  FileText,
  LayoutGrid,
  Pause,
  Plane,
  Sliders,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const { onSignOut } = useAuthCtx();
  const items = [
    { icon: LayoutGrid, active: false },
    { icon: Pause, active: true },
    { icon: Sliders, active: false },
    { icon: FileText, active: false },
    { icon: Plane, active: false },
    { icon: DollarSign, active: false },
    { icon: Users, active: false },
    { icon: BotOff, active: true },
  ];

  return (
    <div className="hidden lg:flex flex-col items-center gap-4 bg-[#141824] border-r border-[#2a3142] p-4 w-20">
      {items.map((item, idx) => (
        <button
          key={idx}
          disabled={!item.active}
          onClick={onSignOut}
          className={`p-3 rounded-lg transition-all duration-200 ${
            item.active
              ? "bg-cyan-500/20 text-cyan-400 cursor-pointer active:scale-90"
              : "text-gray-400 hover:text-white hover:bg-[#1a1f2e]"
          }`}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}
