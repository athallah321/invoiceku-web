'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/app/components/toast'

interface Client {
  id: number
  name: string
}

interface Item {
  description: string
  quantity: number
  price: number
}

interface Settings {
  prefix: string
  starting_number: number
  currency: string
  invoice_logo_url: string
}

const currencySymbols: Record<string, string> = {
  IDR: 'Rp',
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    prefix: 'INV',
    starting_number: 1,
    currency: 'IDR',
    invoice_logo_url: ''
  })
  const [nextNumber, setNextNumber] = useState(1)

  const [form, setForm] = useState({
    client_id: '',
    issue_date: '',
    due_date: '',
    notes: '',
    tax: 0,
    discount: 0,
  })
  const [taxType, setTaxType] = useState<'nominal' | 'persen'>('nominal')
  const [taxPercent, setTaxPercent] = useState(11)
  const [items, setItems] = useState<Item[]>([
    { description: '', quantity: 1, price: 0 }
  ])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch clients
      const clientRes = await api.get('/clients')
      setClients(clientRes.data)

      // Fetch existing invoices to get next number
      const invoiceRes = await api.get('/invoices?all=true')
      const existingCount = invoiceRes.data?.length || 0

      // Load settings
      const savedSettings = localStorage.getItem('invoiceSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({
          prefix: parsed.invoice?.prefix || 'INV',
          starting_number: parsed.invoice?.starting_number || 1,
          currency: parsed.invoice?.currency || 'IDR',
          invoice_logo_url: parsed.invoice?.invoice_logo_url || ''
        })
        setNextNumber(existingCount + (parsed.invoice?.starting_number || 1))
      } else {
        setNextNumber(existingCount + 1)
      }
    } catch (err) {
      // Fallback
      setNextNumber(1)
    } finally {
      setFetching(false)
    }
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const taxAmount = taxType === 'persen' ? subtotal * (taxPercent / 100) : Number(form.tax)
  const total = subtotal + taxAmount - Number(form.discount)

  const formatCurrency = (n: number) => {
    const currency = settings.currency || 'IDR'
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(n)
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(n)
    }
  }

  const invoiceNumber = `${settings.prefix}-${String(nextNumber).padStart(4, '0')}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/invoices', {
        client_id: form.client_id,
        issue_date: form.issue_date,
        due_date: form.due_date,
        notes: form.notes,
        discount: form.discount,
        tax: taxAmount,
        invoice_number: invoiceNumber,
        items
      })
      showToast('Invoice berhasil dibuat!', 'success')
      router.push('/dashboard/invoices')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat invoice', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Buat Invoice</h2>
          <p className="text-gray-500 mt-1">Isi detail invoice baru</p>
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Preview Invoice Number */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.invoice_logo_url && (
            <img src={settings.invoice_logo_url} alt="Logo" className="h-10 object-contain" />
          )}
          <div>
            <p className="text-xs text-blue-500 font-medium">Nomor Invoice</p>
            <p className="text-lg font-bold text-blue-700">{invoiceNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-500">Mata Uang</p>
          <p className="font-semibold text-blue-700">{settings.currency}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Informasi Dasar</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Klien</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih klien</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Invoice</label>
              <input
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Item Invoice</h3>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-6">
                {index === 0 && <label className="block text-xs text-gray-500 mb-1">Deskripsi</label>}
                <input
                  type="text"
                  placeholder="Nama layanan/produk"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <label className="block text-xs text-gray-500 mb-1">Qty</label>}
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-3">
                {index === 0 && <label className="block text-xs text-gray-500 mb-1">Harga ({currencySymbols[settings.currency] || 'Rp'})</label>}
                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-1">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)}
                    className="w-full py-2 text-red-400 hover:text-red-600 text-lg">✕</button>
                )}
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem}
            className="text-sm text-blue-600 hover:underline mt-2">
            + Tambah item
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Ringkasan</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pajak</label>
              <div className="flex gap-2">
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as 'nominal' | 'persen')}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="nominal">Nominal</option>
                  <option value="persen">Persen (%)</option>
                </select>
                {taxType === 'persen' ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                ) : (
                  <input
                    type="number" min="0"
                    value={form.tax}
                    onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                )}
              </div>
              {taxType === 'persen' && (
                <p className="text-xs text-gray-500 mt-1">Pajak: {currencySymbols[settings.currency] || 'Rp'} {formatCurrency(taxAmount)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diskon ({currencySymbols[settings.currency] || 'Rp'})</label>
              <input
                type="number" min="0"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Pajak {taxType === 'persen' ? `(${taxPercent}%)` : ''}</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Diskon</span>
              <span>- {formatCurrency(Number(form.discount))}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Catatan tambahan untuk klien..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 max-w-3xl">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : 'Buat Invoice'}
          </button>
        </div>
      </form>
        </>
      )}
    </>
  )
}