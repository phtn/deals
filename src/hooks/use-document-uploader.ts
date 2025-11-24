import {useAuthCtx} from '@/ctx/auth'
import {useMutation} from 'convex/react'
import {ChangeEvent, DragEvent, useRef, useState} from 'react'
import {api} from '../../convex/_generated/api'

type FileFormat =
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

interface UseDocumentUploaderOptions {
  documentType?: string
  onDocumentCreated?: (documentId: string) => void
}

export function useDocumentUploader(options: UseDocumentUploaderOptions = {}) {
  const {documentType = 'cr', onDocumentCreated} = options
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {user} = useAuthCtx()
  const generateUploadUrl = useMutation(api.files.upload.url)
  const createFileRecord = useMutation(api.files.upload.file)
  const createDocument = useMutation(api.documents.m.create)

  const getFileFormat = (mimeType: string): FileFormat => {
    const formatMap: Record<string, FileFormat> = {
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
    return formatMap[mimeType] || 'image/png'
  }

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
    const documentId = await createDocument({
      data: {
        documentType: documentType as any,
        fileUrl: storageId,
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

    // Notify parent component about document creation
    if (onDocumentCreated) {
      onDocumentCreated(documentId)
    }

    return {documentId, storageId}
  }

  const handleClear = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleBrowseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return {
    selectedFile,
    imagePreview,
    uploading,
    error,
    isDragging,
    fileInputRef,
    user,
    handleFileSelect,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadFileAndCreateDocument,
    handleClear,
    handleBrowseFile,
    setError,
    setUploading,
  }
}

