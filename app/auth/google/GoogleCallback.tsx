'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GoogleCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Memproses login Google...')

  useEffect(() => {
    const auth = searchParams.get('auth')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(`Login gagal: ${error}`)
      setTimeout(() => router.push('/login'), 3000)
      return
    }

    if (auth) {
      try {
        const decoded = JSON.parse(atob(auth.replace(/-_/g, (c: string) => c === '-' ? '+' : '/')))
        const { user, token } = decoded
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setStatus('success')
        setMessage('Login berhasil! Mengalihkan...')
        setTimeout(() => router.push('/dashboard'), 1500)
      } catch (err) {
        setStatus('error')
        setMessage('Gagal memproses data login')
        setTimeout(() => router.push('/login'), 3000)
      }
      return
    }

    router.push('/login')
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />}
      {status === 'success' && <p className="text-gray-700">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  )
}