'use client'

import { Suspense } from 'react'
import GoogleCallback from './GoogleCallback'

function GoogleFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Memproses...</p>
      </div>
    </div>
  )
}

export default function GooglePage() {
  return (
    <Suspense fallback={<GoogleFallback />}>
      <GoogleCallback />
    </Suspense>
  )
}
