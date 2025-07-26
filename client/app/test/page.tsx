'use client'

import { useState } from 'react'

const TestPage = () => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTestRequest = async () => {
    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const response = await fetch('http://localhost:8080/api/resume/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'data',
          message: 'This is a test request'
        }),
        credentials: 'include',
      })

      // Since backend returns plain text, not JSON
      const data = await response.text()
      console.log('Response:', data)
      setResponse(data)

      if (!response.ok) {
        setError(`Request failed with status: ${response.status}`)
      }
    } catch (error) {
      console.error('Test request error:', error)
      setError('Request failed: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <button 
        onClick={handleTestRequest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending Request...' : 'Test Request to localhost:8080/api/resume/upload'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Response:</strong>
          <div className="mt-2 text-sm">
            {response}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestPage