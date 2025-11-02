import { Card } from "@/components/ui/card";
import { Activity, Building2, Gauge, Zap } from "lucide-react";
import MiniChart from "./mini-chart";

const generateData = () =>
  Array.from({ length: 20 }, () => ({
    value: Math.random() * 50 + 50,
  }));

export default function TopMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-[#242938] rounded-lg">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">12,350</span>
            <span className="text-sm text-gray-400">MW</span>
          </div>
          <p className="text-sm text-gray-400">Total Power Generation</p>
        </div>
        <div className="mt-4 h-12">
          <MiniChart data={generateData()} color="#06b6d4" />
        </div>
      </Card>

      <Card className="bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-[#242938] rounded-lg">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-xs text-gray-400">vs 12,350 MW</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">11,870</span>
            <span className="text-sm text-gray-400">MW</span>
          </div>
          <p className="text-sm text-gray-400">Total Power Consumption</p>
        </div>
        <div className="mt-4 h-1 bg-[#2a3142] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-[96%] transition-all duration-700" />
        </div>
      </Card>

      <Card className="bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-[#242938] rounded-lg">
            <Gauge className="w-5 h-5 text-blue-400" />
          </div>
          <div className="relative inline-flex">
            <svg width="48" height="48" className="transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#2a3142"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${98 * 1.25} ${125.6}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">98</span>
            <span className="text-sm text-gray-400">%</span>
          </div>
          <p className="text-sm text-gray-400">Grid Load</p>
        </div>
      </Card>

      <Card className="bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-[#242938] rounded-lg">
            <Building2 className="w-5 h-5 text-green-400" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">23</span>
            <span className="text-xl text-gray-400">/</span>
            <span className="text-xl text-gray-400">25</span>
          </div>
          <p className="text-sm text-gray-400">Active Power Plants</p>
        </div>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                i < 23 ? "bg-green-500" : "bg-[#2a3142]"
              }`}
              style={{ transitionDelay: `${i * 20}ms` }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
