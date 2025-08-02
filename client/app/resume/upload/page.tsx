'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface UploadState {
  file: File | null
  isUploading: boolean
  error: string | null
}

export default function PDFUploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isUploading: false,
    error: null
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file only'
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const uploadToBackend = async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file) 

    const response = await fetch('http://localhost:8080/api/resume/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return

    const file = files[0] // Only take the first file
    const validationError = validateFile(file)

    if (validationError) {
      setUploadState({
        file: null,
        isUploading: false,
        error: validationError
      })
      return
    }

    // Set uploading state
    setUploadState({
      file,
      isUploading: true,
      error: null
    })

    try {
      const result = await uploadToBackend(file)
      
      // Store the result in sessionStorage for the preview page
      sessionStorage.setItem('resumeData', JSON.stringify(result))
      
      // Redirect to preview page
      router.push('/resume/preview')
    } catch (error) {
      setUploadState({
        file,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      })
    }
  }, [router])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const clearUpload = () => {
    setUploadState({
      file: null,
      isUploading: false,
      error: null
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your CV/Resume
          </h1>
          <p className="text-gray-600">
            Upload your resume in PDF format. It will be automatically processed and you'll be taken to review the extracted information.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              uploadState.isUploading
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={uploadState.isUploading ? undefined : handleDragOver}
            onDragLeave={uploadState.isUploading ? undefined : handleDragLeave}
            onDrop={uploadState.isUploading ? undefined : handleDrop}
          >
            {uploadState.isUploading ? (
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
            ) : (
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            )}
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploadState.isUploading 
                ? 'Processing your resume...' 
                : 'Drag and drop your PDF file here'}
            </h3>
            
            {!uploadState.isUploading && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  or click to browse and select a file
                </p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={uploadState.isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </button>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploadState.isUploading}
            />
            
            <div className="mt-4 text-xs text-gray-500">
              <p>• PDF files only</p>
              <p>• Maximum file size: 10MB</p>
              <p>• One resume at a time</p>
            </div>
          </div>
        </div>

        {/* Upload Progress/Status */}
        {(uploadState.file || uploadState.error) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Status
            </h3>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-xs">
                      {uploadState.file?.name || 'Resume upload'}
                    </p>
                    {uploadState.file && (
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadState.file.size)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadState.isUploading && (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {uploadState.error && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    onClick={clearUpload}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={uploadState.isUploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {uploadState.isUploading && (
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2" />
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Processing your resume...
                  </p>
                </div>
              )}
              
              {uploadState.error && (
                <div className="text-sm text-red-600">
                  <p className="font-medium">Upload failed</p>
                  <p>{uploadState.error}</p>
                  <button
                    onClick={clearUpload}
                    className="mt-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Ensure your PDF is text-searchable (not a scanned image)
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Use a clear, professional font and layout
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Keep your resume to 1-2 pages for optimal processing
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Your resume will be automatically processed and you'll be redirected to review the extracted information
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
