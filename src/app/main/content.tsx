'use client'

import BottomSection from '@/components/dashboard/bottom-section'
import DataCard from '@/components/dashboard/data-card'
import OperationalSection from '@/components/dashboard/operational-section'
import SecondaryMetrics from '@/components/dashboard/secondary-metrics'
import TopMetrics from '@/components/dashboard/top-metrics'
import {Flame} from 'lucide-react'

export const Content = () => {
  return (
    <div className='p-6 space-y-6'>
      <TopMetrics />
      <SecondaryMetrics />

      {/* Renewable Energy Section */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
        <DataCard title='Renewable Energy Generation'>
          <div className='space-y-3 mt-3'>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-400'>Total Renewable Capacity</span>
              <span className='text-white'>4,286 MW</span>
            </div>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-400'>
                Installed Renewable Capacity
              </span>
              <span className='text-white'>5,600 MW</span>
            </div>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-400'>Capacity Utilization</span>
              <span className='text-white'>76.5 %</span>
            </div>

            <div className='pt-3 space-y-2'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-400'>Solar Power Output</span>
                <span className='text-white'>1,270 MW</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-400'>Wind Power Output</span>
                <span className='text-white'>920 MW</span>
              </div>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-400'>Biomass Power Output</span>
                <span className='text-white'>245 MW</span>
              </div>
            </div>

            <div className='pt-3 text-xs text-gray-500'>
              Expected generation increase based on weather prediction.
            </div>
          </div>
        </DataCard>

        <DataCard title='Energy Comparison & Efficiency Metrics'>
          <div className='space-y-3 mt-3'>
            <div className='flex items-center gap-2 text-xs'>
              <div className='w-2 h-2 rounded-full bg-green-400' />
              <span className='text-gray-400'>Total Grid Generation</span>
              <span className='text-white ml-auto'>12,436 MW</span>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <div className='w-2 h-2 rounded-full bg-blue-400' />
              <span className='text-gray-400'>Renewable Share</span>
              <span className='text-white ml-auto'>34.4 %</span>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <div className='w-2 h-2 rounded-full bg-gray-400' />
              <span className='text-gray-400'>Fossil Share</span>
              <span className='text-white ml-auto'>65.6 %</span>
            </div>

            <div className='pt-3 space-y-2'>
              <div className='flex justify-between text-xs'>
                <span className='text-gray-400'>Grid Quality Index</span>
                <span className='text-white'>0.92 (SAIFI-CI)</span>
              </div>
              <div className='flex justify-between text-xs'>
                <span className='text-gray-400'>CO₂ Intensity - Grid</span>
                <span className='text-white'>0.51 kg/kWh</span>
              </div>

              <div className='mt-4 space-y-1'>
                {[70, 55, 40, 65, 50, 45, 60, 75, 55, 45].map((val, i) => (
                  <div
                    key={i}
                    className='h-8 rounded transition-all duration-500'
                    style={{
                      background: `linear-gradient(90deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)`,
                      width: `${val}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DataCard>

        <div className='lg:col-span-2'>
          <OperationalSection />
        </div>
      </div>

      {/* Bottom Section */}
      <BottomSection />

      {/* Fossil Energy Section */}
      <DataCard title='Fossil Energy Generation'>
        <div className='grid md:grid-cols-3 gap-6 mt-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-xs'>
              <Flame className='w-4 h-4 text-red-400' />
              <span className='text-gray-400'>Coal-Based Generation</span>
              <span className='text-white ml-auto'>5,200 MW</span>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <Flame className='w-4 h-4 text-orange-400' />
              <span className='text-gray-400'>Natural Gas Generation</span>
              <span className='text-white ml-auto'>2,800 MW</span>
            </div>
            <div className='flex items-center gap-2 text-xs'>
              <Flame className='w-4 h-4 text-yellow-400' />
              <span className='text-gray-400'>Forecast Next 24h (Fossil)</span>
              <span className='text-white ml-auto'>-1.7 %</span>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-400'>Steam Pressure</span>
              <span className='text-white'>175 bar</span>
            </div>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-400'>Boiler Efficiency</span>
              <span className='text-white'>88.3 %</span>
            </div>
            <div className='flex justify-between text-xs'>
              <span className='text-gray-400'>Fuel Consumption Rate</span>
              <span className='text-white'>3,450 kg/h</span>
            </div>
          </div>

          <div className='flex items-center justify-center'>
            <div className='relative w-32 h-32'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle
                  cx='64'
                  cy='64'
                  r='56'
                  stroke='#2a3142'
                  strokeWidth='8'
                  fill='none'
                />
                <circle
                  cx='64'
                  cy='64'
                  r='56'
                  stroke='#ef4444'
                  strokeWidth='8'
                  fill='none'
                  strokeDasharray={`${65 * 3.5} ${351}`}
                  strokeLinecap='round'
                  className='transition-all duration-1000'
                />
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-2xl font-bold text-white'>65%</span>
                <span className='text-xs text-gray-400'>Fossil Share</span>
              </div>
            </div>
          </div>
        </div>
      </DataCard>
    </div>
  )
}
