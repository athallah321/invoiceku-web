'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [status, setStatus] = useState('Memproses login Google...')

  useEffect(() => {
    const auth = searchParams.get('auth')
    const error = searchParams.get('error')

    if (error) {
      setStatus('Login gagal: ' + error)
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    if (!auth) {
      setStatus('Data tidak valid')
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    try {
      // Decode base64 auth data (URL-safe base64)
      const padded = auth + '=='.slice(0, (4 - auth.length % 4) % 4)
      const decoded = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')))

      // Check expiration
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        setStatus('Link sudah kadaluarsa')
        setTimeout(() => router.push('/login'), 2000)
        return
      }

      if (decoded.token && decoded.user) {
        setAuth(decoded.user, decoded.token)
        setStatus('Login berhasil! Mengalihkan...')
        setTimeout(() => router.push('/dashboard'), 500)
      } else {
        setStatus('Data tidak valid')
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch {
      setStatus('Login gagal')
      setTimeout(() => router.push('/login'), 2000)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  )
}