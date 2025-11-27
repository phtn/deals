import {Lens} from '@/components/lens'
import {useToggle} from '@/hooks/use-toggle'
import {formatDate} from '@/utils/date'
import {useQuery} from 'convex/react'
import Image from 'next/image'
import {Drawer} from 'vaul'
import {api} from '../../../../convex/_generated/api'
import {Doc, Id} from '../../../../convex/_generated/dataModel'

interface DocumentViewerDrawerProps {
  document: Doc<'documents'> | null
  onOpenChange: (open: boolean) => void
}

export const DocumentViewerDrawer = ({
  document,
  onOpenChange,
}: DocumentViewerDrawerProps) => {
  const {on: hovering, setOn: setHovering} = useToggle()
  const isOpen = document !== null

  // Fetch the file URL from storage using the storage ID
  const fileUrl = useQuery(
    api.files.get.get,
    document?.fileUrl
      ? {
          storageId: document.fileUrl as Id<'_storage'>,
        }
      : 'skip',
  )

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} modal={true}>
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 bg-black/40 z-40' />
        <Drawer.Content className='flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none'>
          <div className='p-4 bg-background rounded-t-[10px] flex-1 overflow-auto'>
            <div className='mx-auto w-12 h-1.5 shrink-0 rounded-full bg-blue-300 mb-4' />
            {document && (
              <div className='lg:max-w-full max-w-7xl mx-auto space-y-6'>
                <div>
                  <Drawer.Title className='text-2xl font-bone font-thin mb-2'>
                    Document Viewer
                  </Drawer.Title>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                  <div className='text-sm space-y-1 border rounded-lg bg-sidebar/50'>
                    <div className='flex items-center justify-between p-2'>
                      <p>
                        <span className='font-medium tracking-tighter'>
                          Type:
                        </span>{' '}
                        <span className='uppercase'>
                          {document.documentType}
                        </span>
                      </p>
                      <p>
                        <span className='font-medium'>Status:</span>{' '}
                        {document.ocrStatus}
                      </p>
                    </div>

                    {document?.ocrResults?.text && (
                      <div className=''>
                        <h4 className='text-sm font-space my-2 text-orange-500 uppercase'>
                          Raw Extract
                        </h4>
                        <div className='bg-background p-3 border-t text-sm font-mono whitespace-pre-wrap max-h-212 overflow-auto'>
                          {document.ocrResults.text}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OCR Results */}
                  <div className='space-y-2 col-span-2'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold'>
                        OCR Structured Fields
                      </h3>

                      {document?.ocrResults?.processedAt && (
                        <div className='text-xs space-x-2'>
                          <span>Processed:</span>
                          <span>
                            {formatDate(document.ocrResults.processedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='rounded-lg space-y-4 max-h-240 overflow-scroll'>
                      {document.ocrResults ? (
                        <>
                          {document.ocrResults.fields &&
                            Object.keys(document.ocrResults.fields).length >
                              0 && (
                              <div>
                                <div className='bg-background rounded-md p-3 border space-y-2'>
                                  {Object.entries(
                                    document.ocrResults.fields,
                                  ).map(([key, value]) => (
                                    <div
                                      key={key}
                                      className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-1 border-b last:border-b-0'>
                                      <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[120px]'>
                                        {key}:
                                      </span>
                                      <span className='text-sm'>
                                        {typeof value === 'object'
                                          ? JSON.stringify(value, null, 2)
                                          : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </>
                      ) : document.ocrError ? (
                        <div className='bg-destructive/10 border border-destructive/20 rounded-md p-3'>
                          <h4 className='text-sm font-semibold text-destructive mb-1'>
                            OCR Error
                          </h4>
                          <p className='text-sm text-destructive/80'>
                            {document.ocrError}
                          </p>
                        </div>
                      ) : (
                        <div className='text-sm text-muted-foreground'>
                          No OCR results available
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Document Image */}
                  <div className='space-y-2'>
                    <h3 className='text-lg font-semibold'>Document Image</h3>
                    <div className='border rounded-lg overflow-hidden bg-muted/20'>
                      {fileUrl === undefined ? (
                        <div className='flex items-center justify-center h-64 text-muted-foreground'>
                          Loading image...
                        </div>
                      ) : fileUrl ? (
                        <Lens hovering={hovering} setHovering={setHovering}>
                          <Image
                            src={fileUrl}
                            alt={document.fileName || 'Document'}
                            height={600}
                            width={800}
                            className='w-full h-auto aspect-auto object-contain max-h-[600px]'
                          />
                        </Lens>
                      ) : (
                        <div className='flex items-center justify-center h-64 text-muted-foreground'>
                          No image available
                        </div>
                      )}
                    </div>
                    {document.fileName && (
                      <p className='text-sm'>
                        <span className='font-medium'>File:</span>
                        <span className='font-mono opacity-70 ml-2'>
                          {document.fileName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
