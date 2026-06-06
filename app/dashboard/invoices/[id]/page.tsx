'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import { ArrowLeft, Download, Send, CheckCircle, Loader2, Pencil } from 'lucide-react'
import { useToast } from '@/app/components/toast'

interface Invoice {
  id: number
  invoice_number: string
  status: string
  issue_date: string
  due_date: string
  subtotal: number
  tax: number
  discount: number
  total: number
  notes: string
  client: {
    name: string
    email: string
    phone: string
    company: string
    address: string
  }
  items: {
    id: number
    description: string
    quantity: number
    price: number
    total: number
  }[]
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchInvoice()
  }, [])

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${params.id}`)
      setInvoice(res.data)
    } catch {
      router.push('/dashboard/invoices')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/invoices/${params.id}/status`, { status })
      fetchInvoice()
      showToast('Status berhasil diupdate!', 'success')
    } catch {
      showToast('Gagal update status', 'error')
    }
  }

  const sendEmail = async () => {
    if (!invoice?.client?.email) {
      showToast('Email klien tidak tersedia', 'error')
      return
    }

    if (!confirm(`Kirim invoice ke ${invoice.client.email}?`)) return

    setSending(true)
    setSent(false)
    try {
      await api.post(`/invoices/${params.id}/send-email`)
      setSent(true)
      showToast('Invoice berhasil dikirim!', 'success')
      updateStatus('sent')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengirim invoice', 'error')
    } finally {
      setSending(false)
    }
  }

  
  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      sent: 'bg-blue-100 text-blue-600',
      paid: 'bg-green-100 text-green-600',
      overdue: 'bg-red-100 text-red-600',
    }
    const label: Record<string, string> = {
      draft: 'Draft', sent: 'Terkirim', paid: 'Lunas', overdue: 'Overdue'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[status]}`}>
        {label[status]}
      </span>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!invoice) return null

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">{invoice.invoice_number}</h2>
          <p className="text-gray-500 mt-1">Detail invoice</p>
        </div>
        {statusBadge(invoice.status)}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href={`/dashboard/invoices/${params.id}/edit`}
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition">
          <Pencil size={16} />Edit
        </Link>

        <Link href={`${process.env.NEXT_PUBLIC_API_URL}/invoices/${params.id}/pdf?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          <Download size={16} />Download PDF
        </Link>

        {invoice.client?.email && (
          <button
            onClick={sendEmail}
            disabled={sending}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              sent
                ? 'bg-green-100 text-green-600'
                : sending
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim...
              </>
            ) : sent ? (
              <>
                <CheckCircle size={16} />
                Terkirim
              </>
            ) : (
              <>
                <Send size={16} />
                Kirim Email
              </>
            )}
          </button>
        )}
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {['draft', 'sent', 'paid', 'overdue'].map((s) => (
            <button key={s}
              onClick={() => updateStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                invoice.status === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {s === 'draft' ? 'Draft' : s === 'sent' ? 'Terkirim' : s === 'paid' ? 'Lunas' : 'Overdue'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6">
        {/* Header Invoice */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-1">INVOICE</h2>
            <p className="text-gray-500 text-sm">{invoice.invoice_number}</p>
          </div>
          <div className="text-sm text-gray-600 sm:text-right">
            <p><span className="font-medium">Tanggal:</span> {invoice.issue_date}</p>
            <p><span className="font-medium">Jatuh Tempo:</span> {invoice.due_date}</p>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase font-medium mb-2">Ditagihkan Kepada</p>
          <p className="font-semibold text-gray-900">{invoice.client.name}</p>
          {invoice.client.company && <p className="text-gray-600 text-sm">{invoice.client.company}</p>}
          {invoice.client.email && <p className="text-gray-600 text-sm">{invoice.client.email}</p>}
          {invoice.client.phone && <p className="text-gray-600 text-sm">{invoice.client.phone}</p>}
          {invoice.client.address && <p className="text-gray-600 text-sm">{invoice.client.address}</p>}
        </div>

        {/* Items */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] mb-8">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs font-medium text-gray-500">Deskripsi</th>
                <th className="text-center py-3 text-xs font-medium text-gray-500">Qty</th>
                <th className="text-right py-3 text-xs font-medium text-gray-500">Harga</th>
                <th className="text-right py-3 text-xs font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{formatRupiah(item.price)}</td>
                  <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatRupiah(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatRupiah(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Pajak</span>
              <span>{formatRupiah(invoice.tax)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Diskon</span>
              <span>- {formatRupiah(invoice.discount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatRupiah(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Catatan</p>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </>
  )
}