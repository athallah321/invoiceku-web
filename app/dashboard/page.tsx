'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { FileText, CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign, ArrowRight, Loader2 } from 'lucide-react'

interface Invoice {
  id: number
  invoice_number: string
  status: string
  total: number
  issue_date: string
  due_date: string
  client: { name: string }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices')
      setInvoices(res.data)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  // Stats
  const totalInvoice = invoices.length
  const paid = invoices.filter(i => i.status === 'paid').length
  const sent = invoices.filter(i => i.status === 'sent').length
  const overdue = invoices.filter(i => i.status === 'overdue').length
  const draft = invoices.filter(i => i.status === 'draft').length

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + Number(i.total), 0)

  const pendingAmount = invoices
    .filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + Number(i.total), 0)

  // Monthly chart data
  const getMonthlyData = () => {
    const months: Record<string, { count: number; revenue: number }> = {}
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      months[key] = { count: 0, revenue: 0 }
    }

    invoices.forEach(inv => {
      const date = new Date(inv.issue_date)
      const key = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      if (months[key]) {
        months[key].count++
        if (inv.status === 'paid') {
          months[key].revenue += Number(inv.total)
        }
      }
    })

    return Object.entries(months)
  }

  const monthlyData = getMonthlyData()
  const maxRevenue = Math.max(...monthlyData.map(([, d]) => d.revenue), 1)

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
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}>
        {label[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1">
          Halo, {user?.name ?? 'User'} 👋
        </h2>
        <p className="text-blue-100 text-sm sm:text-base">
          Siap invoicing hari ini? Yuk cek overview bisnis kamu.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalInvoice}</p>
          <p className="text-gray-500 text-xs mt-1">Total Invoice</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="text-lg lg:text-2xl font-bold text-green-600 truncate">{formatRupiah(totalRevenue)}</p>
          <p className="text-gray-500 text-xs mt-1">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <Clock size={16} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{sent}</p>
          <p className="text-gray-500 text-xs mt-1">Menunggu Bayar</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{overdue}</p>
          <p className="text-gray-500 text-xs mt-1">Invoice Overdue</p>
        </div>
      </div>

      {/* Chart + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Revenue 6 Bulan Terakhir</h3>
            <Link href="/dashboard/reports" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Detail <ArrowRight size={14} />
            </Link>
          </div>
          <div className="h-40 flex items-end justify-between gap-2">
            {monthlyData.map(([month, data]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-32">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 min-h-[4px]"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{month}</span>
              </div>
            ))}
          </div>
          {totalRevenue === 0 && (
            <p className="text-center text-gray-400 mt-4 text-sm">Belum ada data revenue</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Status Invoice</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Lunas</span>
              </div>
              <span className="font-semibold text-gray-900">{paid}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalInvoice ? (paid / totalInvoice) * 100 : 0}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-600">Terkirim</span>
              </div>
              <span className="font-semibold text-gray-900">{sent}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalInvoice ? (sent / totalInvoice) * 100 : 0}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Overdue</span>
              </div>
              <span className="font-semibold text-gray-900">{overdue}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalInvoice ? (overdue / totalInvoice) * 100 : 0}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
                <span className="text-sm text-gray-600">Draft</span>
              </div>
              <span className="font-semibold text-gray-900">{draft}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${totalInvoice ? (draft / totalInvoice) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Invoice Terbaru</h3>
          <Link href="/dashboard/invoices" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada invoice</p>
            <Link href="/dashboard/invoices/create" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Buat invoice pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 w-12">No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">No. Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Klien</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Jatuh Tempo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.slice(0, 5).map((inv, index) => (
                  <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}>
                    <td className="px-4 py-4 text-sm text-gray-500 text-center">{index + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{inv.invoice_number}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">{inv.client?.name}</td>
                    <td className="px-4 py-4">{statusBadge(inv.status)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">{inv.due_date}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">{formatRupiah(inv.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}