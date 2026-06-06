'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { Users, Plus, Trash2, ChevronLeft, ChevronRight, Pencil, X, Search, Loader2 } from 'lucide-react'
import { useToast } from '@/app/components/toast'

interface Client {
  id: number
  name: string
  email: string
  phone: string
  company: string
  address: string
}

export default function ClientsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', address: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients')
      setClients(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, form)
        showToast('Klien berhasil diupdate!', 'success')
      } else {
        await api.post('/clients', form)
        showToast('Klien berhasil ditambahkan!', 'success')
      }
      resetForm()
      fetchClients()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan klien', 'error')
    }
  }

  const handleEdit = (client: Client) => {
    setForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || ''
    })
    setEditingId(client.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus klien ini?')) return
    try {
      await api.delete(`/clients/${id}`)
      fetchClients()
      showToast('Klien berhasil dihapus!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus klien', 'error')
    }
  }

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', company: '', address: '' })
    setEditingId(null)
    setShowForm(false)
  }

  // Filtered clients
  const filtered = clients.filter(client => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      client.name.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.company?.toLowerCase().includes(term)
    )
  })

  const PER_PAGE = 10
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Klien</h2>
          <p className="text-gray-500 mt-1">Kelola data klien kamu</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Tambah Klien
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-48 mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2">
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{editingId ? 'Edit Klien' : 'Tambah Klien Baru'}</h3>
            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={resetForm}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {editingId ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
          <Users size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">
            {search ? 'Klien tidak ditemukan' : 'Belum ada klien'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-3 text-sm text-blue-600 hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-center px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 w-12">No</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Nama</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Telepon</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 hidden lg:table-cell">Perusahaan</th>
                  <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((client, index) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center">{(page - 1) * PER_PAGE + index + 1}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{client.name}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{client.email || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{client.phone || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{client.company || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(client)}
                          className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(client.id)}
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
      )}
    </>
  )
}