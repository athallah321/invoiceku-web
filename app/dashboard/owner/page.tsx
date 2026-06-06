'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/app/components/toast'
import { Users, FileText, DollarSign, ShoppingCart, Loader2, TrendingUp, Database, Plus, Search, Edit, Trash2, X } from 'lucide-react'

interface DashboardStats {
  total_users: number
  total_invoices: number
  total_clients: number
  total_revenue: number
}

interface User {
  id: number
  name: string
  email: string
  role: string
  invoices_count: number
  created_at: string
}

export default function OwnerPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'dashboard' | 'users' | 'backup'>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' })
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchData()
  }, [])

  useEffect(() => {
    if (tab === 'users') fetchUsers()
  }, [tab])

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/dashboard')
      setStats(res.data.stats)
    } catch (err: any) {
      if (err.response?.status === 403) {
        showToast('Akses ditolak. Hanya owner yang bisa mengakses.', 'error')
        router.push('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?search=${search}`)
      setUsers(res.data.data)
    } catch (err: any) {
      showToast('Gagal memuat users', 'error')
    }
  }

  useEffect(() => {
    if (tab === 'users') {
      const timeout = setTimeout(() => fetchUsers(), 300)
      return () => clearTimeout(timeout)
    }
  }, [search])

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, formData)
        showToast('User berhasil diupdate!', 'success')
      } else {
        await api.post('/admin/users', formData)
        showToast('User berhasil dibuat!', 'success')
      }
      setShowModal(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan user', 'error')
    }
  }

  const handleEditUser = (u: User) => {
    setEditingUser(u)
    setFormData({ name: u.name, email: u.email, password: '', role: u.role })
    setShowModal(true)
  }

  const handleDeleteUser = async (userId: number, name: string) => {
    if (!confirm(`Hapus user ${name}? Semua data akan dihapus.`)) return
    try {
      await api.delete(`/admin/users/${userId}`)
      showToast('User berhasil dihapus!', 'success')
      fetchUsers()
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal hapus user', 'error')
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/backup/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoiceku-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      showToast('Backup berhasil diunduh!', 'success')
    } catch (err: any) {
      showToast('Gagal backup data', 'error')
    } finally {
      setExporting(false)
    }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Owner Panel</h2>
        <p className="text-gray-500 mt-1">Monitoring & manajemen Invoiceku</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <TrendingUp size={16} /> Dashboard
        </button>
        <button onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Users size={16} /> Manajemen User
        </button>
        <button onClick={() => setTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'backup' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Database size={16} /> Backup Data
        </button>
      </div>

      {tab === 'dashboard' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Users size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              <p className="text-gray-500 text-xs mt-1">Total Users</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <FileText size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_invoices}</p>
              <p className="text-gray-500 text-xs mt-1">Total Invoice</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <ShoppingCart size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
              <p className="text-gray-500 text-xs mt-1">Total Klien</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                <DollarSign size={20} className="text-yellow-600" />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-green-600 truncate">{formatRupiah(stats.total_revenue)}</p>
              <p className="text-gray-500 text-xs mt-1">Total Revenue</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-sm text-blue-700">
              <strong>Info:</strong> Login sebagai owner: <span className="font-medium">{user?.name}</span> ({user?.email})
            </p>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'user' }); setShowModal(true) }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <Plus size={16} /> Tambah User
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nama</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 hidden lg:table-cell">Daftar</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center hidden md:table-cell">{u.invoices_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEditUser(u)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={u.id === user?.id}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Database size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Export Backup Data</h3>
                <p className="text-sm text-gray-500">Download semua data dalam format JSON</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Data yang akan di-backup:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Semua user ({stats?.total_users || 0} user)</li>
                <li>• Semua invoice ({stats?.total_invoices || 0} invoice)</li>
                <li>• Semua klien ({stats?.total_clients || 0} klien)</li>
              </ul>
            </div>

            <button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
              {exporting ? 'Mengeksport...' : <><Database size={16} /> Download Backup</>}
            </button>
          </div>

          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
            <p className="text-sm text-amber-700">
              <strong>Tips:</strong> Lakukan backup secara rutin untuk menjaga keamanan data Anda. File backup dapat diimport kembali jika diperlukan.
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && '(kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Owner</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Batal
              </button>
              <button onClick={handleSaveUser} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}