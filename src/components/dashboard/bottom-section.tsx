import { Progress } from "@/components/ui/progress";
import DataCard from "./data-card";

export default function BottomSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <DataCard
        title="Consumer Load Distribution"
        subtitle="Peak load recorded in last 24 hours"
      >
        <div className="space-y-3 mt-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Total Active Load</span>
            <span className="text-white">12,110 MW</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Power Factor (PF)</span>
            <span className="text-white">0.94</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Demand Growth Rate</span>
            <span className="text-white">+1.8 %</span>
          </div>

          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Diversity Factor</span>
              <span className="text-white">1.14</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Load Forecast Error</span>
              <span className="text-white">2.1 %</span>
            </div>
            <div className="mt-2">
              <Progress value={21} className="h-1 bg-[#2a3142]" />
            </div>
          </div>
        </div>
      </DataCard>
    </div>
  );
}
