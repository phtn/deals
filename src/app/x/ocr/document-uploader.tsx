'use client'

import {Button} from '@/components/ui/button'
import {useAuthCtx} from '@/ctx/auth'
import {parseLTOCertificate, VehicleRegistration} from '@/lib/vision/parse-lto'
import {useMutation} from 'convex/react'
import Image from 'next/image'
import {ChangeEvent, DragEvent, FormEvent, useRef, useState} from 'react'
import toast from 'react-hot-toast'
import {api} from '../../../../convex/_generated/api'

interface DocumentUploaderProps {
  onDataExtracted: (data: VehicleRegistration | null) => void
  onDocumentCreated?: (documentId: string) => void
}

export function DocumentUploader({
  onDataExtracted,
  onDocumentCreated,
}: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [rawText, setRawText] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {user} = useAuthCtx()
  const generateUploadUrl = useMutation(api.files.upload.url)
  const createFileRecord = useMutation(api.files.upload.file)
  const createDocument = useMutation(api.documents.m.create)
  const updateOcrStatus = useMutation(api.documents.m.updateOcrStatus)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setSelectedFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Map MIME type to file format
  const getFileFormat = (
    mimeType: string,
  ):
    | 'image/jpeg'
    | 'image/png'
    | 'image/avif'
    | 'image/webp'
    | 'image/gif'
    | 'image/heic'
    | 'image/heif'
    | 'image/tiff'
    | 'image/svg+xml'
    | 'pdf'
    | 'csv'
    | 'xlsx' => {
    const formatMap: Record<
      string,
      | 'image/jpeg'
      | 'image/png'
      | 'image/avif'
      | 'image/webp'
      | 'image/gif'
      | 'image/heic'
      | 'image/heif'
      | 'image/tiff'
      | 'image/svg+xml'
      | 'pdf'
      | 'csv'
      | 'xlsx'
    > = {
      'image/jpeg': 'image/jpeg',
      'image/png': 'image/png',
      'image/avif': 'image/avif',
      'image/webp': 'image/webp',
      'image/gif': 'image/gif',
      'image/heic': 'image/heic',
      'image/heif': 'image/heif',
      'image/tiff': 'image/tiff',
      'image/svg+xml': 'image/svg+xml',
      'application/pdf': 'pdf',
      'text/csv': 'csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'xlsx',
    }
    return formatMap[mimeType] || 'image/png' // default fallback
  }

  const uploadFileAndCreateDocument = async (file: File) => {
    if (!user) {
      throw new Error('User must be authenticated to upload documents')
    }

    // Step 1: Get upload URL from Convex
    const uploadUrl = await generateUploadUrl()

    // Step 2: Upload file to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {'Content-Type': file.type},
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to storage')
    }

    // Convex returns storageId as JSON
    const {storageId} = await uploadResponse.json()

    // Step 3: Create file record (optional but good for tracking)
    const fileFormat = getFileFormat(file.type)
    await createFileRecord({
      storageId,
      author: user.uid,
      type: 'image',
      format: fileFormat,
    })

    // Step 4: Create document entry
    // Store storageId as fileUrl - we can get the actual URL later using files.get query
    const documentId = await createDocument({
      data: {
        documentType: 'cr', // Default, can be changed later
        fileUrl: storageId, // Store storageId as fileUrl reference
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        ocrStatus: 'pending',
        uploadedBy: user.uid,
        uploadedByName: user.displayName || user.email || 'Unknown',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    })

    return {documentId, storageId}
  }

  const handleSubmit = async (
    e?: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e?.preventDefault()

    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    if (!user) {
      setError('Please sign in to upload documents')
      return
    }

    setLoading(true)
    setUploading(true)
    setError('')

    try {
      // Step 1: Upload file and create document
      const {documentId} = await uploadFileAndCreateDocument(selectedFile)

      toast.success('Document uploaded successfully')

      // Step 2: Process OCR
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

        // Store raw text
        setRawText(data.text)

        // Parse the text into structured data
        const parsed = parseLTOCertificate(data.text)
        onDataExtracted(parsed)

        // Update document with OCR results
        await updateOcrStatus({
          id: documentId,
          status: 'completed',
          ocrResults: {
            text: data.text,
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

      // Notify parent component about document creation
      if (onDocumentCreated) {
        onDocumentCreated(documentId)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process document'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setError('')
    setRawText('')
    onDataExtracted(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className='h-2/5 flex flex-col'>
      <form onSubmit={handleSubmit} className='flex-1 flex flex-col'>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex-1 w-full border-x-[0.5px] dark:border-greyed
            transition-all duration-200 cursor-pointer
            flex items-center justify-center relative overflow-hidden
            ${isDragging ? 'bg-blue-50 scale-[1.02]' : 'border-greyed/60 dark:bg-white bg-dysto/30'}
            ${imagePreview ? 'p-2' : 'p-8'}
            min-h-[400px]
          `}>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='hidden'
          />

          {imagePreview ? (
            <div className='relative w-full h-full flex items-center justify-center group'>
              <Image
                src={imagePreview}
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
            <div className='text-center space-y-4'>
              <div className='text-4xl'>📄</div>
              <div>
                <p className='text-lg font-semibold text-gray-700'>
                  {isDragging
                    ? 'Drop your document here'
                    : 'Drag & drop your document'}
                </p>
                <p className='text-sm text-gray-500 mt-2'>or click to browse</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className='mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm'>
            {error}
          </div>
        )}

        <div className='mt-0 flex border-t-[0.44px] border-foreground/30'>
          {imagePreview && (
            <Button
              size='lg'
              variant='ghost'
              onClick={handleClear}
              className='flex-1 px-4 py-2 dark:bg-background/80 text-amber-50 hover:bg-gray-300 transition-colors rounded-none!'>
              Clear
            </Button>
          )}
          <Button
            type='submit'
            size='lg'
            variant='ghost'
            disabled={!selectedFile || loading || !user}
            className='flex-1 px-4 py-2 dark:bg-background/80 text-amber-50 hover:bg-gray-300 transition-colors rounded-none!'>
            {uploading
              ? 'Uploading...'
              : loading
                ? 'Processing...'
                : 'Scan Document'}
          </Button>
        </div>
      </form>

      {rawText && (
        <div className='mt-2 h-screen border-l-[0.33px]'>
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
