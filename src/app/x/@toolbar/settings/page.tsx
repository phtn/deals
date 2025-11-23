'use client'

import {Button} from '@/components/ui/button'
import {Toolbar} from '@/components/ui/toolbar'
import {Icon} from '@/lib/icons'

const SettingsToolbar = () => {
  return (
    <Toolbar>
      <Button size='sq' variant='ghost'>
        <Icon name='secure' className='size-4' />
      </Button>
      <Button size='sq' variant='ghost'>
        <Icon name='close' className='size-4' />
      </Button>
    </Toolbar>
  )
}

export default SettingsToolbar
