'use client'

import {parseLTOCertificate, VehicleRegistration} from '@/lib/vision/parse-lto'
import {ChangeEvent, FormEvent, ReactNode, useState} from 'react'

export default function OCRUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [structuredData, setStructuredData] =
    useState<VehicleRegistration | null>(null)
  const [showRawText, setShowRawText] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setExtractedText('')
      setStructuredData(null)
      setError('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const data: {text: string} = await response.json()
      setExtractedText(data.text)

      // Parse the text into structured data
      const parsed = parseLTOCertificate(data.text)
      setStructuredData(parsed)
    } catch (err) {
      setError('Failed to extract text from image')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // const formatLabel = (key: string): string => {
  //   // Map of field keys to display labels
  //   const labelMap: Record<string, string> = {
  //     fieldOffice: 'Field Office',
  //     officeCode: 'Office Code',
  //     dateOfIssue: 'Date of Issue',
  //     certificateNumber: 'Certificate Number (CR No.)',
  //     plateNumber: 'Plate Number',
  //     engineNumber: 'Engine Number',
  //     chassisNumber: 'Chassis Number',
  //     vin: 'VIN',
  //     fileNumber: 'File Number',
  //     vehicleType: 'Vehicle Type',
  //     vehicleCategory: 'Vehicle Category',
  //     makeBrand: 'Make/Brand',
  //     color: 'Color',
  //     typeOfFuel: 'Type of Fuel',
  //     classification: 'Classification',
  //     bodyType: 'Body Type',
  //     series: 'Series',
  //     yearModel: 'Year Model',
  //     yearRebuilt: 'Year Rebuilt',
  //     pistonDisplacement: 'Piston Displacement',
  //     grossWeight: 'Gross Weight',
  //     netWeight: 'Net Weight',
  //     maxPower: 'Max Power (KW)',
  //     passengerCapacity: 'Passenger Capacity',
  //     ownerName: "Owner's Name",
  //     ownerAddress: "Owner's Address",
  //     encumberedTo: 'Encumbered To',
  //     detailsOfFirstRegistration: 'Details of First Registration',
  //     remarks: 'Remarks',
  //     orNumber: 'O.R. Number',
  //     orDate: 'O.R. Date',
  //     amount: 'Amount',
  //     registrantSignature: "Registrant's Signature",
  //     by: 'By',
  //     chiefOfOffice: 'Chief of Office',
  //     note: 'Note',
  //   }

  //   return (
  //     labelMap[key] ||
  //     key
  //       .replace(/([A-Z])/g, ' $1')
  //       .replace(/^./, (str) => str.toUpperCase())
  //       .trim()
  //   )
  // }

  // Field group component matching document layout - always 4 columns
  const FieldGroup = ({
    fields,
  }: {
    fields: Array<{key: keyof VehicleRegistration; label: string}>
  }) => {
    return (
      <div className='grid grid-cols-4 gap-x-6 gap-y-3 py-2 border-b border-gray-100 last:border-b-0'>
        {fields.map((field) => (
          <div key={field.key} className='space-y-1'>
            <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
              {field.label}
            </div>
            <div className='text-sm font-medium text-gray-900'>
              {structuredData?.[field.key] || '-'}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const DataSection = ({
    title,
    children,
  }: {
    title: string
    children: ReactNode
  }) => {
    return (
      <div className='bg-white rounded-lg border border-gray-300 shadow-sm p-6'>
        <h2 className='text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300 uppercase tracking-wide'>
          {title}
        </h2>
        <div className='space-y-0'>{children}</div>
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto'>
      <form
        onSubmit={handleSubmit}
        className='mb-4 flex items-center justify-between'>
        <h1 className='text-lg font-bold mb-2'>Vehicle Registration OCR</h1>
        <div className='flex items-center space-x-4'>
          <input
            type='file'
            accept='image/*,.pdf'
            onChange={handleFileChange}
            className='block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />

          <button
            type='submit'
            disabled={!selectedFile || loading}
            className='px-6 py-2 bg-blue-600 whitespace-nowrap text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
            {loading ? 'Processing...' : 'Extract Text'}
          </button>
        </div>
      </form>

      {error && (
        <div className='mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200'>
          {error}
        </div>
      )}

      {structuredData && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between mb-4'>
            <div />
            <button
              onClick={() => setShowRawText(!showRawText)}
              className='text-sm'>
              {showRawText ? 'Hide' : 'Show'} Raw Text
            </button>
          </div>

          <div className='space-y-6'>
            {/* Office Information */}
            <DataSection title='Office Information'>
              <div className='grid grid-cols-4 gap-x-6 gap-y-3'>
                {structuredData.fieldOffice && (
                  <div className='space-y-1'>
                    <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
                      Field Office
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      {structuredData.fieldOffice}
                    </div>
                  </div>
                )}
                {structuredData.officeCode && (
                  <div className='space-y-1'>
                    <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
                      Office Code
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      {structuredData.officeCode}
                    </div>
                  </div>
                )}
                {structuredData.dateOfIssue && (
                  <div className='space-y-1'>
                    <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
                      Date
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      {structuredData.dateOfIssue}
                    </div>
                  </div>
                )}
                {structuredData.certificateNumber && (
                  <div className='space-y-1'>
                    <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
                      CR No.
                    </div>
                    <div className='text-sm font-medium text-gray-900'>
                      {structuredData.certificateNumber}
                    </div>
                  </div>
                )}
              </div>
            </DataSection>

            {/* Vehicle Information - Matching document groups */}
            <DataSection title='Vehicle Information'>
              {/* Group 1: PLATE NO, ENGINE NO, CHASSIS NO, VIN */}
              <FieldGroup
                fields={[
                  {key: 'plateNumber', label: 'PLATE NO.'},
                  {key: 'engineNumber', label: 'ENGINE NO.'},
                  {key: 'chassisNumber', label: 'CHASSIS NO.'},
                  {key: 'vin', label: 'VIN'},
                ]}
              />

              {/* Group 2: FILE NO, VEHICLE TYPE, VEHICLE CATEGORY, MAKE/BRAND */}
              <FieldGroup
                fields={[
                  {key: 'fileNumber', label: 'FILE NO.'},
                  {key: 'vehicleType', label: 'VEHICLE TYPE'},
                  {key: 'vehicleCategory', label: 'VEHICLE CATEGORY'},
                  {key: 'makeBrand', label: 'MAKE/BRAND'},
                ]}
              />

              {/* Group 4: PASSENGER CAPACITY, COLOR, TYPE OF FUEL, CLASSIFICATION */}
              <FieldGroup
                fields={[
                  {key: 'passengerCapacity', label: 'PASSENGER CAPACITY'},
                  {key: 'color', label: 'COLOR'},
                  {key: 'typeOfFuel', label: 'TYPE OF FUEL'},
                  {key: 'classification', label: 'CLASSIFICATION'},
                ]}
              />

              {/* Group 5: BODY TYPE, SERIES, GROSS WEIGHT, NET WEIGHT */}
              <FieldGroup
                fields={[
                  {key: 'bodyType', label: 'BODY TYPE'},
                  {key: 'series', label: 'SERIES'},
                  {key: 'grossWeight', label: 'GROSS WEIGHT'},
                  {key: 'netWeight', label: 'NET WEIGHT'},
                ]}
              />

              {/* Group 6: YEAR MODEL, YEAR REBUILT, PISTON DISPLACEMENT, MAX POWER (KW) */}
              <FieldGroup
                fields={[
                  {key: 'yearModel', label: 'YEAR MODEL'},
                  {key: 'yearRebuilt', label: 'YEAR REBUILT'},
                  {key: 'pistonDisplacement', label: 'PISTON DISPLACEMENT'},
                  {key: 'maxPower', label: 'MAX POWER (KW)'},
                ]}
              />
            </DataSection>

            {/* Owner Information */}
            <DataSection title="Owner's Information">
              {structuredData.ownerName && (
                <div className='py-2 border-b border-gray-100'>
                  <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>
                    OWNER&apos;S NAME
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {structuredData.ownerName}
                  </div>
                </div>
              )}
              {structuredData.ownerAddress && (
                <div className='py-2 border-b border-gray-100'>
                  <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>
                    OWNER&apos;S ADDRESS
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {structuredData.ownerAddress}
                  </div>
                </div>
              )}
              {structuredData.encumberedTo && (
                <div className='py-2 border-b border-gray-100 last:border-b-0'>
                  <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>
                    ENCUMBERED TO
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {structuredData.encumberedTo}
                  </div>
                </div>
              )}
            </DataSection>

            {/* Registration Details */}
            <DataSection title='Registration Details'>
              {structuredData.detailsOfFirstRegistration && (
                <div className='py-2 border-b border-gray-100'>
                  <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>
                    DETAILS OF FIRST REGISTRATION
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {structuredData.detailsOfFirstRegistration}
                  </div>
                </div>
              )}

              {/* Group 7: O.R. NO, O.R. DATE, AMOUNT */}
              <FieldGroup
                fields={[
                  {key: 'orNumber', label: 'O.R. NO.'},
                  {key: 'orDate', label: 'O.R. DATE'},
                  {key: 'amount', label: 'AMOUNT'},
                ]}
              />

              {structuredData.remarks && (
                <div className='py-2 border-b border-gray-100'>
                  <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>
                    REMARKS
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {structuredData.remarks}
                  </div>
                </div>
              )}

              {structuredData.chiefOfOffice && (
                <div className='py-2 border-b border-gray-100'>
                  <div className='text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1'>
                    BY
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {structuredData.chiefOfOffice}
                  </div>
                </div>
              )}
            </DataSection>

            {/* Note */}
            {structuredData.note && (
              <div className='bg-blue-50 rounded-lg border border-blue-200 p-4'>
                <h3 className='text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide'>
                  NOTE
                </h3>
                <p className='text-xs text-gray-700 whitespace-pre-wrap leading-relaxed'>
                  {structuredData.note}
                </p>
              </div>
            )}
          </div>

          {showRawText && extractedText && (
            <div className='mt-6 bg-gray-50 rounded-lg border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold mb-4'>Raw Extracted Text</h3>
              <div className='p-4 bg-white rounded border border-gray-200 max-h-96 overflow-auto'>
                <pre className='text-xs whitespace-pre-wrap font-mono text-gray-700'>
                  {extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
