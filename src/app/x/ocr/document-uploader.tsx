'use client'

import {Button} from '@/components/ui/button'
import {useDocumentUploader} from '@/hooks/use-document-uploader'
import {useGeminiParsing} from '@/hooks/use-gemini-parsing'
import {useOCRProcessing} from '@/hooks/use-ocr-processing'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {VehicleRegistration} from '@/lib/vision/parse-lto'
import {useMutation} from 'convex/react'
import Image from 'next/image'
import {FormEvent, useState} from 'react'
import toast from 'react-hot-toast'
import {api} from '../../../../convex/_generated/api'

interface DocumentUploaderProps {
  onDataExtracted: (data: VehicleRegistration | null) => void
  onDocumentCreated?: (documentId: string) => void
  documentType?: string
}

export function DocumentUploader({
  onDataExtracted,
  onDocumentCreated,
  documentType = 'cr',
}: DocumentUploaderProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [rawText, setRawText] = useState<string>('')

  const updateOcrStatus = useMutation(api.documents.m.updateOcrStatus)

  const uploader = useDocumentUploader({
    documentType,
    onDocumentCreated,
  })

  const {extractText: extractOCRText, loading: ocrLoading} = useOCRProcessing()
  const {parseText, loading: geminiLoading} = useGeminiParsing()

  const handleSubmit = async (
    e?: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e?.preventDefault()

    if (!uploader.selectedFile) {
      uploader.setError('Please select an image file')
      return
    }

    if (!uploader.user) {
      uploader.setError('Please sign in to upload documents')
      return
    }

    setLoading(true)
    uploader.setUploading(true)
    uploader.setError('')

    try {
      // Step 1: Upload file and create document
      const {documentId} = await uploader.uploadFileAndCreateDocument(
        uploader.selectedFile,
      )

      toast.success('Document uploaded successfully')

      // Step 2: Process OCR
      try {
        const extractedText = await extractOCRText(uploader.selectedFile)

        // Store raw text
        setRawText(extractedText)

        // Parse the text into structured data using Gemini
        const parsed = await parseText(extractedText)
        onDataExtracted(parsed)

        // Update document with OCR results
        await updateOcrStatus({
          id: documentId,
          status: 'completed',
          ocrResults: {
            text: extractedText,
            confidence: 0.95, // You can calculate this from OCR response if available
            fields: parsed,
            processedAt: Date.now(),
          },
        })

        toast.success('OCR processing completed')
      } catch (ocrError) {
        // Update document with OCR failure status
        await updateOcrStatus({
          id: documentId,
          status: 'failed',
          ocrError:
            ocrError instanceof Error ? ocrError.message : 'Unknown OCR error',
        })
        throw ocrError // Re-throw to be caught by outer catch
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process document'
      uploader.setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
      uploader.setUploading(false)
    }
  }

  const handleClear = () => {
    uploader.handleClear()
    setRawText('')
    onDataExtracted(null)
  }

  const isLoading = loading || ocrLoading || geminiLoading || uploader.uploading

  return (
    <div className='h-2/5 flex flex-col border-t-[0.33px] border-stone-400/80'>
      <form onSubmit={handleSubmit} className='flex-1 flex flex-col'>
        <div
          onDragOver={uploader.handleDragOver}
          onDragLeave={uploader.handleDragLeave}
          onDrop={uploader.handleDrop}
          onClick={uploader.handleBrowseFile}
          className={`
            flex-1 w-full border-l-[0.33px] border-stone-400/80 dark:border-greyed
            transition-all duration-200 cursor-pointer
            flex items-center justify-center relative overflow-hidden
            ${uploader.isDragging ? 'bg-blue-50 scale-[1.02]' : 'border-greyed/60 dark:bg-white'}
            ${uploader.imagePreview ? 'p-2' : 'p-8'}
            min-h-[400px]
          `}>
          <input
            ref={uploader.fileInputRef}
            type='file'
            accept='image/*'
            onChange={uploader.handleFileChange}
            className='hidden'
          />

          {uploader.imagePreview ? (
            <div className='relative w-full h-full flex items-center justify-center group'>
              <Image
                src={uploader.imagePreview}
                alt='Document preview'
                fill
                className='object-contain rounded-lg shrink-0'
                priority
              />
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-lg'>
                <span className='opacity-0 group-hover:opacity-100 text-white font-semibold text-sm bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm'>
                  Click to change image
                </span>
              </div>
            </div>
          ) : (
            <div className='text-center space-y-5 relative size-64 aspect-square'>
              <Icon
                name='arc'
                className='absolute left-0 top-0 size-8 text-stone-400/80'
              />
              <Icon
                name='arc'
                className='absolute right-0 top-0 -scale-x-100 size-8 text-stone-400/80'
              />

              <div className='flex justify-center'>
                <Icon name='doc' className='size-12 text-blue-400' />
              </div>

              <div className='space-y-2'>
                <p className='text-xl font-semibold font-figtree tracking-tight text-stone-500'>
                  {uploader.isDragging ? (
                    <span>Drop your document here</span>
                  ) : (
                    <span>
                      <span className='font-bone tracking-[0.032em]'>Drop</span>{' '}
                      <span className='font-bone tracking-[0.032em]'>
                        Zone
                      </span>{' '}
                    </span>
                  )}
                </p>
                <p className='text-base text-stone-500 rounded-lg border border-dashed border-stone-400/80 font-medium font-space w-fit mx-auto px-4 py-1'>
                  or click to browse
                </p>
              </div>
              <Icon
                name='arc'
                className='absolute right-0 bottom-0 -scale-100 size-8 text-stone-400/80'
              />

              <Icon
                name='arc'
                className='absolute left-0 bottom-0 -scale-y-100 size-8 text-stone-400/80'
              />
            </div>
          )}
        </div>

        {uploader.error && (
          <div className='mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm'>
            {uploader.error}
          </div>
        )}

        <div className='mt-0 flex border-l-[0.44px] border-y-[0.44px] border-stone-400/80'>
          {uploader.imagePreview && (
            <Button
              size='lg'
              variant='ghost'
              onClick={handleClear}
              className='flex-1 px-4 py-2 dark:bg-background/80 text-blue-400 dark:text-amber-50 hover:bg-gray-300 transition-colors rounded-none!'>
              Clear
            </Button>
          )}
          <Button
            size='lg'
            variant='ghost'
            type={!uploader.selectedFile ? 'button' : 'submit'}
            onClick={
              !uploader.selectedFile ? uploader.handleBrowseFile : undefined
            }
            disabled={isLoading || !uploader.user}
            className={cn(
              'flex-1 px-4 py-2 dark:bg-background/80  text-blue-400 dark:text-amber-50 hover:bg-gray-300 transition-colors rounded-none! tracking-normal ',
              {'text-stone-500': !uploader.selectedFile},
            )}>
            {uploader.uploading
              ? 'Uploading...'
              : isLoading
                ? 'Processing...'
                : !uploader.selectedFile
                  ? 'Select a document to scan'
                  : 'Scan Document'}
          </Button>
        </div>
      </form>

      {rawText && (
        <div className='mt-2 h-screen border-l-[0.33px] border-stone-400/80'>
          <h3 className='text-sm px-3 font-semibold mb-2'>Raw Extract</h3>
          <div className='flex-1 overflow-scroll h-180 bg-gray-50 p-4'>
            <pre className='text-xs whitespace-pre-wrap font-mono text-gray-700'>
              {rawText}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
