import {EditableCheck} from './check'
import EditableDepositSlip from './deposit-slip'
import EditableFundTransfer from './fund-transfer'

export const AddDocument = () => {
  return (
    <div className='w-full h-screen overflow-y-scroll pb-44 space-y-6 px-4 md:px-6 overflow-x-hidden border-t-[0.33px] border-stone-400/80 dark:border-greyed'>
      <EditableCheck />
      <EditableDepositSlip />
      <EditableFundTransfer />
    </div>
  )
}
