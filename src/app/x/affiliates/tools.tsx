import CircularProgress from '@/components/dashboard/circular-progress'
import {Card} from '@/components/ui/card'
import {Leaf, Shield, Wifi} from 'lucide-react'

export const Tools = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='p-2 bg-[#242938] rounded-lg w-fit'>
              <Wifi className='w-4 h-4 text-cyan-400' />
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-white'>92.4</span>
              <span className='text-sm text-gray-400'>%</span>
            </div>
            <p className='text-xs text-gray-400'>Transmission Efficiency</p>
          </div>
          <CircularProgress value={92} color='#06b6d4' />
        </div>
      </Card>

      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='p-2 bg-[#242938] rounded-lg w-fit'>
              <Leaf className='w-4 h-4 text-green-400' />
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-white'>37</span>
              <span className='text-sm text-gray-400'>%</span>
            </div>
            <p className='text-xs text-gray-400'>Renewable Energy Ratio</p>
          </div>
          <CircularProgress value={37} color='#f97316' size={56} />
        </div>
      </Card>

      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-5'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <div className='p-2 bg-[#242938] rounded-lg w-fit'>
              <Shield className='w-4 h-4 text-purple-400' />
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-white'>0.89</span>
              <span className='text-sm text-gray-400'>of 1</span>
            </div>
            <p className='text-xs text-gray-400'>Grid Stability Index</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
