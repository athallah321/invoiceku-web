'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Users, Package, Clock, Calendar, Loader2 } from 'lucide-react'

interface Invoice {
  id: number
  invoice_number: string
  status: string
  total: number
  issue_date: string
  due_date: string
  client: { name: string }
  items: { description: string; total: number }[]
}

interface ClientStats {
  name: string
  count: number
  totalRevenue: number
}

interface ProductStats {
  description: string
  count: number
  totalRevenue: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/invoices')
      setInvoices(res.data)
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  // Per-Client Stats
  const getClientStats = (): ClientStats[] => {
    const map: Record<string, ClientStats> = {}
    invoices.forEach(inv => {
      const name = inv.client?.name || 'Unknown'
      if (!map[name]) map[name] = { name, count: 0, totalRevenue: 0 }
      map[name].count++
      if (inv.status === 'paid') map[name].totalRevenue += Number(inv.total)
    })
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }

  // Top Products
  const getProductStats = (): ProductStats[] => {
    const map: Record<string, ProductStats> = {}
    invoices.forEach(inv => {
      inv.items?.forEach(item => {
        const key = item.description
        if (!map[key]) map[key] = { description: key, count: 0, totalRevenue: 0 }
        map[key].count++
        map[key].totalRevenue += Number(item.total)
      })
    })
    return Object.values(map).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5)
  }

  // Aging Report (overdue invoices)
  const getAgingReport = () => {
    const now = new Date()
    return invoices
      .filter(i => i.status === 'overdue')
      .map(inv => {
        const due = new Date(inv.due_date)
        const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
        return { ...inv, daysOverdue }
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }

  // Monthly Trend Detail
  const getMonthlyTrend = () => {
    const months: Record<string, { paid: number; pending: number; overdue: number; revenue: number }> = {}
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      months[key] = { paid: 0, pending: 0, overdue: 0, revenue: 0 }
    }

    invoices.forEach(inv => {
      const date = new Date(inv.issue_date)
      const key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      if (months[key]) {
        if (inv.status === 'paid') months[key].paid++
        else if (inv.status === 'sent') months[key].pending++
        else if (inv.status === 'overdue') months[key].overdue++
        if (inv.status === 'paid') months[key].revenue += Number(inv.total)
      }
    })

    return Object.entries(months)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const clientStats = getClientStats()
  const productStats = getProductStats()
  const agingReport = getAgingReport()
  const monthlyTrend = getMonthlyTrend()
  const topClients = clientStats.slice(0, 5)

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Laporan Lengkap</h2>
        <p className="text-gray-500 mt-1">Analisis detail performa bisnis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Klien Terbesar</h3>
          </div>
          {topClients.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.count} invoice</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">{formatRupiah(client.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Produk/Jasa Terlaris</h3>
          </div>
          {productStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {productStats.map((product, index) => (
                <div key={product.description} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.description}</p>
                    <p className="text-xs text-gray-500">{product.count} kali</p>
                  </div>
                  <p className="text-sm font-semibold text-purple-600">{formatRupiah(product.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aging Report */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Aging Report</h3>
          </div>
          {agingReport.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Tidak ada invoice overdue</p>
          ) : (
            <div className="space-y-3">
              {agingReport.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.client?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">{formatRupiah(inv.total)}</p>
                    <p className="text-xs text-red-500 font-medium">
                      {inv.daysOverdue} hari overdue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trend Detail */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Trend Bulanan</h3>
          </div>
          <div className="space-y-3">
            {monthlyTrend.map(([month, data]) => (
              <div key={month} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900 mb-2">{month}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="font-semibold text-green-600">{data.paid}</p>
                    <p className="text-gray-500">Lunas</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <p className="font-semibold text-yellow-600">{data.pending}</p>
                    <p className="text-gray-500">Pending</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="font-semibold text-red-600">{data.overdue}</p>
                    <p className="text-gray-500">Overdue</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-600">{formatRupiah(data.revenue).replace('Rp', '').trim()}</p>
                    <p className="text-gray-500">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}