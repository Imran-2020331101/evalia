'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface UploadedFile {
  file: File
  id: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  errorMessage?: string
}

export default function PDFUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

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

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress: 100, status: 'success' }
              : f
          )
        )
      } else {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress: Math.min(progress, 100) }
              : f
          )
        )
      }
    }, 200)
  }

  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      const validationError = validateFile(file)
      const fileId = generateId()

      if (validationError) {
        setUploadedFiles(prev => [...prev, {
          file,
          id: fileId,
          progress: 0,
          status: 'error',
          errorMessage: validationError
        }])
        return
      }

      // Add file to upload queue
      setUploadedFiles(prev => [...prev, {
        file,
        id: fileId,
        progress: 0,
        status: 'uploading'
      }])

      // Simulate upload process
      simulateUpload(fileId)
    })
  }, [])

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

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your CV/Resume
          </h1>
          <p className="text-gray-600">
            Upload your resume in PDF format to get started with your application
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your PDF file here
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse and select a file
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="mt-4 text-xs text-gray-500">
              <p>• PDF files only</p>
              <p>• Maximum file size: 10MB</p>
              <p>• Recommended: Keep file size under 5MB for faster upload</p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Progress
            </h3>
            
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-red-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {uploadedFile.status === 'success' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">
                        Upload completed successfully!
                      </span>
                      <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                  
                  {uploadedFile.status === 'error' && (
                    <div className="text-sm text-red-600">
                      <p className="font-medium">Upload failed</p>
                      <p>{uploadedFile.errorMessage}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadedFiles.some(f => f.status === 'success') && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <h4 className="font-medium text-green-900">
                  Resume uploaded successfully!
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Your resume has been processed and is ready for review. You can now proceed to the next step.
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Continue to Application
              </button>
              <button className="bg-white text-green-600 border border-green-300 px-4 py-2 rounded-md hover:bg-green-50 transition-colors">
                Upload Another Resume
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
              Include relevant keywords related to your target position
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
