import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface DataCardProps {
  title: string;
  subtitle?: string;
  metrics?: { label: string; value: string; unit: string; color?: string }[];
  children?: ReactNode;
}

export default function DataCard({
  title,
  subtitle,
  metrics,
  children,
}: DataCardProps) {
  return (
    <Card className="bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>

        {metrics && (
          <div className="space-y-3">
            {metrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${metric.color || "bg-cyan-400"}`}
                  />
                  <span className="text-sm text-gray-300">{metric.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-semibold">
                    {metric.value}
                  </span>
                  <span className="text-xs text-gray-400">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {children}

        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-200 mt-4">
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
