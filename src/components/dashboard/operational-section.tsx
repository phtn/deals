import DataCard from "@/components/dashboard/data-card";
import { Progress } from "@/components/ui/progress";

export default function OperationalSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-white text-lg font-semibold">
        Real-Time Power System Operational Parameters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard
          title="Renewable Generation Metrics"
          subtitle="Source Composition"
          metrics={[
            { label: "Solar", value: "25", unit: "%", color: "bg-yellow-400" },
            { label: "Wind", value: "22", unit: "%", color: "bg-blue-400" },
            { label: "Biomass", value: "5", unit: "%", color: "bg-green-400" },
          ]}
        >
          <div className="space-y-2 mt-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Active Power</span>
                <span className="text-white">4,286 MW</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Reactive Power</span>
                <span className="text-white">2,500 MVAr</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Steam Temperature</span>
                <span className="text-white">1020 °C</span>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Frequency Deviation</span>
                <span className="text-white">+0.02 Hz</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Solar Irradiance</span>
                  <span className="text-white">812 W/m²</span>
                </div>
                <Progress value={81} className="h-1 bg-[#2a3142]" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Storage SOC (Battery)</span>
                  <span className="text-white">81.4 %</span>
                </div>
                <Progress value={81} className="h-1 bg-[#2a3142]" />
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Thermal & Combustion Plant"
          subtitle="Performance Indicators"
        >
          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">
                  Energy per unit of fuels generated
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Gross Active Power</span>
                <span className="text-white">6,150 MW</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Auxiliary Efficiency</span>
                <span className="text-white">41.83 %</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Steam Temperature</span>
                <span className="text-white">535 °C</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Turbine Heat Rate</span>
                <span className="text-white">8,570 kJ/kWh</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Fuel Flow Rate</span>
                <span className="text-white">12,400 l/h</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">CO₂ Emission Rate</span>
                <span className="text-white">0.63 kg/kWh</span>
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard title="Transmission Line & Busbar Status" subtitle="Metrics">
          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Active voltage lines</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Nominal Voltage</span>
                <span className="text-white">230 kV</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Maximum Line Current</span>
                <span className="text-white">1.92 kA</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Line Loading</span>
                <span className="text-white">92.4 %</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Transmission Loss</span>
                <span className="text-white">4.31 %</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Power Angle</span>
                <span className="text-white">18.2 °</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Reactive Compensation</span>
                <span className="text-white">+245 MVAr</span>
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard title="Substation Element" subtitle="Performance">
          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">
                  Real-time power monitoring
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Incoming Sub P</span>
                <span className="text-white">230 MW</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Bus Frequency</span>
                <span className="text-white">1.92 Hz</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Transformer Oil</span>
                <span className="text-white">92.4 °C</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Tap Changer Position</span>
                <span className="text-white">••••••</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Ground Resistance</span>
                <span className="text-white">18.2 Ω</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Harmonic Distortion</span>
                <span className="text-white">+245 THD</span>
              </div>
            </div>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
