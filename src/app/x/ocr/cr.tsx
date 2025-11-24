'use client'

import {EditableCell} from '@/components/ui/editable-cell'
import {VehicleRegistration} from '@/lib/vision/parse-lto'
import Image from 'next/image'
import * as React from 'react'

// Initial data state
const INITIAL_DATA = {
  fieldOffice: '',
  officeCode: '',
  crNo: '',
  date: '',
  plateNo: '',
  engineNo: '',
  chassisNo: '',
  vin: '',
  fileNo: '',
  vehicleType: '',
  vehicleCategory: '',
  makeBrand: '',
  capacity: '',
  color: '',
  fuel: '',
  classification: '',
  bodyType: '',
  series: '',
  grossWeight: '',
  netWeight: '',
  yearModel: '',
  yearRebuilt: '',
  displacement: '',
  maxPower: '',
  ownerName: '',
  ownerAddress: '',
  encumberedTo: '',
  firstRegDetails: '',
  orNo: '',
  orDate: '',
  amount: '',
  remarks: '',
}

type FormData = typeof INITIAL_DATA

interface CertificateOfRegistrationFormProps {
  ocrData?: VehicleRegistration | null
}

// Map VehicleRegistration fields to CR form fields
function mapOcrDataToForm(ocrData: VehicleRegistration): Partial<FormData> {
  return {
    fieldOffice: ocrData.fieldOffice || '',
    officeCode: ocrData.officeCode || '',
    crNo: ocrData.certificateNumber || '',
    date: ocrData.dateOfIssue || '',
    plateNo: ocrData.plateNumber || '',
    engineNo: ocrData.engineNumber || '',
    chassisNo: ocrData.chassisNumber || '',
    vin: ocrData.vin || 'N/A',
    fileNo: ocrData.fileNumber || '',
    vehicleType: ocrData.vehicleType || '',
    vehicleCategory: ocrData.vehicleCategory || '',
    makeBrand: ocrData.makeBrand || '',
    capacity: ocrData.passengerCapacity || '',
    color: ocrData.color || '',
    fuel: ocrData.typeOfFuel || '',
    classification: ocrData.classification || '',
    bodyType: ocrData.bodyType || '',
    series: ocrData.series || '',
    grossWeight: ocrData.grossWeight || '',
    netWeight: ocrData.netWeight || 'N/A',
    yearModel: ocrData.yearModel || '',
    yearRebuilt: ocrData.yearRebuilt || 'N/A',
    displacement: ocrData.pistonDisplacement || '',
    maxPower: ocrData.maxPower || 'N/A',
    ownerName: ocrData.ownerName || '',
    ownerAddress: ocrData.ownerAddress || '',
    encumberedTo: ocrData.encumberedTo || 'N/A',
    firstRegDetails: ocrData.detailsOfFirstRegistration || '',
    orNo: ocrData.orNumber || '',
    orDate: ocrData.orDate || '',
    amount: ocrData.amount || '',
    remarks: ocrData.remarks || '',
  }
}

export function CertificateOfRegistrationForm({
  ocrData,
}: CertificateOfRegistrationFormProps) {
  const [data, setData] = React.useState<FormData>(INITIAL_DATA)

  // Update form data when OCR data changes
  React.useEffect(() => {
    if (ocrData) {
      const mappedData = mapOcrDataToForm(ocrData)
      setData((prev) => ({...prev, ...mappedData}))
    }
  }, [ocrData])

  const updateField = (field: keyof typeof INITIAL_DATA) => (value: string) => {
    setData((prev) => ({...prev, [field]: value}))
  }

  return (
    <div className='portrait:h-[88lvh] overflow-y-scroll w-full md:max-w-6xl md:px-6 px-3 bg-white text-black shadow-2xl overflow-scroll print:shadow-none min-w-0'>
      {/* Header Section */}
      <div className='flex flex-col items-center p-4 relative'>
        <div className='absolute md:left-8 -left-4 -top-3  md:top-8 scale-50 md:scale-100'>
          <Image src='/svg/dot.svg' alt='dot' width={64} height={64} />
        </div>
        <div className='absolute md:right-8 -right-4 -top-3  md:top-8 scale-50 md:scale-100'>
          <Image src='/svg/lto.svg' alt='lto' width={64} height={64} />
        </div>

        <div className='text-center space-y-0 -mt-2 md:mt-1'>
          <h4 className='text-xs md:text-sm font-space md:font-semibold tracking-wide text-stone-500'>
            Republic of the Philippines
          </h4>
          <h2 className='md:block hidden md:text-base text-sm md:font-semibold uppercase tracking-wide'>
            Department of Transportation
          </h2>
          <h1 className='md:block hidden md:text-base text-sm md:font-semibold uppercase tracking-wider'>
            Land Transportation Office
          </h1>
        </div>

        <div className='portrait:hidden mt-4 w-full flex justify-center md:max-w-lg md:grid grid-cols-[auto_1fr] gap-1 md:gap-x-4 gap-y-1 text-sm'>
          <div className='text-xs md:font-medium md:text-right'>
            <span className='portrait:hidden pr-1'>Field </span>Office
          </div>
          <input
            className='portrait:max-w-32 border-b-[0.33px] border-stone-400/80 font-sans px-2 bg-transparent focus:outline-none focus:border-blue-500'
            value={data.fieldOffice}
            onChange={(e) => updateField('fieldOffice')(e.target.value)}
            placeholder='Field office'
          />
          <div className='text-xs md:font-medium md:text-right'>
            <span className='portrait:hidden pr-1'>Office</span>Code
          </div>
          <input
            className='portrait:max-w-32 border-b-[0.33px] border-stone-400/80 font-sans px-2 bg-transparent focus:outline-none focus:border-blue-500'
            value={data.officeCode}
            onChange={(e) => updateField('officeCode')(e.target.value)}
            placeholder='Office code'
          />
        </div>
      </div>

      {/* Title Bar */}
      <div className='md:mb-2 flex flex-row items-center justify-between'>
        <div className='md:flex hidden font-semibold uppercase tracking-wider bg-black text-white p-2 print:bg-black print:text-white'>
          Certificate of Registration
        </div>
        <div className='md:hidden text-sm font-medium uppercase tracking-tighter bg-black text-white py-0.5 px-1.5 print:bg-black print:text-white'>
          CR
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm md:text-base font-medium md:font-bold'>
            CR No.
          </span>
          <span className='text-base md:text-xl font-bold text-red-600 px-2 rounded-sm tracking-widest'>
            {data.crNo}
          </span>
        </div>
        <div className='flex items-center justify-center gap-2 text-xs m:text-sm md:w-64'>
          <span>Date</span>
          <input
            className='bg-transparent font-bold w-24 text-center focus:outline-none'
            value={data.date}
            onChange={(e) => updateField('date')(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid Form */}
      <div className='border-x-2 border-y-2 border-greyed bg-greyed gap-px grid grid-cols-1 md:grid-cols-4'>
        {/* Row 1 */}
        <EditableCell
          label='Plate No.'
          value={data.plateNo}
          onChange={updateField('plateNo')}
        />
        <EditableCell
          label='Engine No.'
          value={data.engineNo}
          onChange={updateField('engineNo')}
        />
        <EditableCell
          label='Chassis No.'
          value={data.chassisNo}
          onChange={updateField('chassisNo')}
        />
        <EditableCell
          label='VIN'
          value={data.vin}
          onChange={updateField('vin')}
        />

        {/* Row 2 */}
        <EditableCell
          label='File No.'
          value={data.fileNo}
          onChange={updateField('fileNo')}
        />
        <EditableCell
          label='Vehicle Type'
          value={data.vehicleType}
          onChange={updateField('vehicleType')}
          className='text-[10px]'
        />
        <EditableCell
          label='Vehicle Category'
          value={data.vehicleCategory}
          onChange={updateField('vehicleCategory')}
        />
        <EditableCell
          label='Make/Brand'
          value={data.makeBrand}
          onChange={updateField('makeBrand')}
        />

        {/* Row 3 */}
        <EditableCell
          label='Passenger Capacity'
          value={data.capacity}
          onChange={updateField('capacity')}
        />
        <EditableCell
          label='Color'
          value={data.color}
          onChange={updateField('color')}
        />
        <EditableCell
          label='Type of Fuel'
          value={data.fuel}
          onChange={updateField('fuel')}
        />
        <EditableCell
          label='Classification'
          value={data.classification}
          onChange={updateField('classification')}
        />

        {/* Row 4 */}
        <EditableCell
          label='Body Type'
          value={data.bodyType}
          onChange={updateField('bodyType')}
        />
        <EditableCell
          label='Series'
          value={data.series}
          onChange={updateField('series')}
        />
        <EditableCell
          label='Gross Weight'
          value={data.grossWeight}
          onChange={updateField('grossWeight')}
        />
        <EditableCell
          label='Net Weight'
          value={data.netWeight}
          onChange={updateField('netWeight')}
        />

        {/* Row 5 */}
        <EditableCell
          label='Year Model'
          value={data.yearModel}
          onChange={updateField('yearModel')}
        />
        <EditableCell
          label='Year Rebuilt'
          value={data.yearRebuilt}
          onChange={updateField('yearRebuilt')}
        />
        <EditableCell
          label='Piston Displacement'
          value={data.displacement}
          onChange={updateField('displacement')}
        />
        <EditableCell
          label='Max Power (KW)'
          value={data.maxPower}
          onChange={updateField('maxPower')}
        />

        {/* Owner Section */}
        <EditableCell
          label="Owner's Name"
          value={data.ownerName}
          onChange={updateField('ownerName')}
          className='md:col-span-4 min-h-[50px] items-start'
        />

        <EditableCell
          label="Owner's Address"
          value={data.ownerAddress}
          onChange={updateField('ownerAddress')}
          className='md:col-span-4 min-h-[50px] whitespace-normal items-start'
        />

        <EditableCell
          label='Encumbered To'
          value={data.encumberedTo}
          onChange={updateField('encumberedTo')}
          className='md:col-span-4'
        />

        {/* Lower Grid */}
        <EditableCell
          label='Details of First Registration'
          value={data.firstRegDetails}
          onChange={updateField('firstRegDetails')}
          className=''
        />
        <EditableCell
          label='O.R. No.'
          value={data.orNo}
          onChange={updateField('orNo')}
        />
        <EditableCell
          label='O.R. Date'
          value={data.orDate}
          onChange={updateField('orDate')}
        />
        <EditableCell
          label='Amount'
          value={data.amount}
          onChange={updateField('amount')}
          className=''
        />
        {/* Amount Row - Using a custom cell for layout consistency with the image */}
        <div className='md:col-span-4 bg-white p-2'>
          <span className='text-xs font-bold'>REMARKS</span>
          <textarea
            className='w-full h-11 resize-none border-none outline-none text-sm uppercase font-mono p-2'
            placeholder='Enter remarks here...'
            value={data.remarks}
            onChange={(e) => updateField('remarks')(e.target.value)}
          />
        </div>
      </div>

      {/* Footer Signatures */}
      <div className='border-x-2 border-b-2 dark:border-background/60 border-foreground/80 grid grid-cols-1 md:grid-cols-4 md:flex-row'>
        <div className='flex-1 flex flex-col col-span-1 h-full'>
          <div className='dark:bg-background bg-foreground flex items-center justify-center text-white px-2 py-2 text-sm font-bold w-full'>
            REGISTRANT&apos;S SIGNATURE
          </div>
        </div>

        <div className='flex-1 flex flex-col items-center justify-end pt-12 relative border-l dark:border-background border-foreground/60 col-span-3'>
          <span className='absolute top-4 left-0 font-bold text-sm px-4'>
            BY:
          </span>
          {/* Signature Placeholder */}
          <div className='w-full text-center'>
            <div className='font-bold text-lg uppercase border-t border-black pt-1 w-full text-center'>
              Atty. Vigor D. Mendoza II
            </div>
            <div className='text-sm'>Assistant Secretary</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className='p-4 bg-transparent text-[10px] md:text-xs text-neutral-600 space-y-4 pb-30'>
        <p className='hidden'>
          NOTE: This is a computer generated form certifying that the motor
          vehicle described herein is duly registered. This certificate is VALID
          only when signed by authorized LTO Officials, properly sealed and
          accompanied by Official Receipt as proof of payment. Any unauthorized
          erasure or alteration hereon will invalidate this document.
        </p>

        {/* Barcode representation */}
      </div>
    </div>
  )
}
