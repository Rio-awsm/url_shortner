import axios from 'axios'
import React, { useState } from 'react'
import MetadataViewer from './MetadataViewer'

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [metadata, setMetadata] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('https://url-shortner-2kza.onrender.com/api/shorten', { originalUrl })
      setShortUrl(`https://url-shortner-2kza.onrender.com/${response.data.shortUrl}`)
      setQrCode(response.data.qrCode)
      setMetadata(response.data.metadata)
    } catch (error) {
      console.error('Error shortening URL:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">URL Shortener & QR Code Generator</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Shortening...' : 'Shorten URL and Generate QR Code'}
          </button>
        </form>
        {shortUrl && (
          <div className="mt-4">
            <p className="font-semibold">Shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {shortUrl}
            </a>
          </div>
        )}
        {qrCode && (
          <div className="mt-4">
            <p className="font-semibold">QR Code:</p>
            <img src={qrCode} alt="QR Code" className="mt-2" />
          </div>
        )}
        <MetadataViewer metadata={metadata} />
      </div>
    </div>
  )
}

export default UrlShortener
