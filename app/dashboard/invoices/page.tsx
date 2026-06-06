'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import { FileText, Plus, ChevronLeft, ChevronRight, Search, X, Loader2, Trash2, Pencil, Download } from 'lucide-react'
import { useToast } from '@/app/components/toast'

interface Invoice {
  id: number
  invoice_number: string
  status: string
  issue_date: string
  due_date: string
  total: number
  client: { name: string }
}

interface Client {
  id: number
  name: string
}

const PER_PAGE = 10

export default function InvoicesPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [page, setPage] = useState(1)

  // Filter states
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invRes, clientRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/clients')
      ])
      setInvoices(invRes.data)
      setClients(clientRes.data)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // Filtered invoices
  const filtered = invoices.filter(inv => {
    // Search by invoice number or client name
    if (search) {
      const term = search.toLowerCase()
      if (!inv.invoice_number.toLowerCase().includes(term) &&
          !inv.client?.name?.toLowerCase().includes(term)) {
        return false
      }
    }

    // Filter by status
    if (filterStatus && inv.status !== filterStatus) return false

    // Filter by client
    if (filterClient && inv.client?.name !== filterClient) return false

    // Filter by date range
    if (filterDateFrom && inv.issue_date < filterDateFrom) return false
    if (filterDateTo && inv.issue_date > filterDateTo) return false

    return true
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('')
    setFilterClient('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setPage(1)
  }

  const hasFilters = search || filterStatus || filterClient || filterDateFrom || filterDateTo

  const handleDelete = async (id: number, number: string) => {
    if (!confirm(`Hapus invoice ${number}? Tindakan ini tidak bisa dibatalkan.`)) return

    try {
      await api.delete(`/invoices/${id}`)
      setInvoices(prev => prev.filter(inv => inv.id !== id))
      showToast('Invoice berhasil dihapus!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus invoice', 'error')
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (filterDateFrom) params.append('date_from', filterDateFrom)
      if (filterDateTo) params.append('date_to', filterDateTo)

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/invoices/export/excel${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `invoices-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      showToast('Export Excel berhasil!', 'success')
    } catch {
      showToast('Gagal export Excel', 'error')
    } finally {
      setExporting(false)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      draft:   { label: 'Draft',    class: 'bg-gray-100 text-gray-600' },
      sent:    { label: 'Terkirim', class: 'bg-blue-100 text-blue-600' },
      paid:    { label: 'Lunas',   class: 'bg-green-100 text-green-600' },
      overdue: { label: 'Overdue',  class: 'bg-red-100 text-red-600' },
    }
    const s = map[status] ?? map.draft
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.class}`}>
        {s.label}
      </span>
    )
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Invoice</h2>
          <p className="text-gray-500 mt-1">Kelola semua invoice kamu</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/invoices/create"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            <Plus size={16} /> Buat Invoice
          </Link>
          <button onClick={handleExportExcel} disabled={exporting}
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            <Download size={16} /> {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center mb-6">
        {/* Search */}
        <div className="relative w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Terkirim</option>
          <option value="paid">Lunas</option>
          <option value="overdue">Overdue</option>
        </select>

        {/* Client */}
        <select
          value={filterClient}
          onChange={(e) => { setFilterClient(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Klien</option>
          {clients.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Dari Tanggal"
        />

        {/* Date To */}
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => { setFilterDateTo(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Sampai Tanggal"
        />

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}

        {hasFilters && (
          <span className="text-xs text-gray-500 ml-auto">
            {filtered.length} invoice
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">
            {hasFilters ? 'Tidak ada invoice yang sesuai filter' : 'Belum ada invoice'}
          </p>
          {hasFilters ? (
            <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline">
              Hapus filter
            </button>
          ) : (
            <Link href="/dashboard/invoices/create" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Buat invoice pertama
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-center px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 w-12">No</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">No. Invoice</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Klien</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Jatuh Tempo</th>
                    <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Total</th>
                    <th className="text-center px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((inv, index) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center">{(page - 1) * PER_PAGE + index + 1}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}>{inv.invoice_number}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{inv.client?.name}</td>
                      <td className="px-4 sm:px-6 py-4">{statusBadge(inv.status)}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{inv.due_date}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 text-right">{formatRupiah(inv.total)}</td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/invoices/${inv.id}/edit`) }}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(inv.id, inv.invoice_number) }}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Menampilkan {(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}