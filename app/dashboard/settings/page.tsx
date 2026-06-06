'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { User, Building2, FileText, Save, Loader2, Upload, X } from 'lucide-react'
import { useToast } from '@/app/components/toast'

interface BusinessSettings {
  name: string
  address: string
  phone: string
  email: string
  logo_url: string
}

interface InvoiceSettings {
  prefix: string
  starting_number: number
  currency: string
  invoice_logo_url: string
  template: string
  logo_position: string
  invoice_language: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: ''
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Password requirements
  const passwordRequirements = [
    { test: /.{8,}/, label: 'Minimal 8 karakter' },
    { test: /[A-Z]/, label: '1 huruf besar' },
    { test: /[a-z]/, label: '1 huruf kecil' },
    { test: /\d/, label: '1 angka' },
    { test: /[@$!%*?&]/, label: '1 karakter khusus (@$!%*?&)' },
  ]

  const isPasswordValid = (pwd: string) => {
    return passwordRequirements.every(req => req.test.test(pwd))
  }

  // Business state
  const [business, setBusiness] = useState<BusinessSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    logo_url: ''
  })

  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    prefix: 'INV',
    starting_number: 1,
    currency: 'IDR',
    invoice_logo_url: '',
    template: 'modern',
    logo_position: 'left',
    invoice_language: 'id'
  })

  // Active tab
  const [activeTab, setActiveTab] = useState('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Fetch user profile
      const userRes = await api.get('/user')
      setProfile({
        name: userRes.data.name || '',
        email: userRes.data.email || ''
      })

      // Fetch settings
      const res = await api.get('/settings')
      if (res.data) {
        setBusiness({
          name: res.data.business?.name || '',
          address: res.data.business?.address || '',
          phone: res.data.business?.phone || '',
          email: res.data.business?.email || '',
          logo_url: res.data.business?.logo_url || '',
        })
        setInvoiceSettings({
          prefix: res.data.invoice?.prefix || 'INV',
          starting_number: res.data.invoice?.starting_number || 1,
          currency: res.data.invoice?.currency || 'IDR',
          invoice_logo_url: res.data.invoice?.invoice_logo_url || '',
          template: res.data.invoice?.template || 'modern',
          logo_position: res.data.invoice?.logo_position || 'left',
          invoice_language: res.data.invoice?.invoice_language || 'id',
        })
      }
    } catch {
      const savedSettings = localStorage.getItem('invoiceSettings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setBusiness(parsed.business || business)
        setInvoiceSettings(parsed.invoice || invoiceSettings)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2MB', 'error')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await api.post('/upload/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data.url) {
        setInvoiceSettings({ ...invoiceSettings, invoice_logo_url: res.data.url })
        showToast('Logo berhasil diupload! Klik Simpan untuk menyimpan.', 'success')
      }
    } catch (err: any) {
      showToast('Gagal upload logo', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    // Validate password if being changed
    if (newPassword) {
      if (!isPasswordValid(newPassword)) {
        showToast('Password harus mengandung minimal 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus', 'error')
        return
      }
      if (newPassword !== confirmPassword) {
        showToast('Konfirmasi password tidak cocok', 'error')
        return
      }
    }

    setSaving(true)
    try {
      // Update profile
      await api.put('/user/profile', {
        name: profile.name,
        email: profile.email,
        password: newPassword || undefined
      })

      // Save settings
      await api.post('/settings', {
        business,
        invoice: invoiceSettings
      })

      localStorage.setItem('invoiceSettings', JSON.stringify({
        business,
        invoice: invoiceSettings
      }))

      setNewPassword('')
      setConfirmPassword('')
      showToast('Pengaturan berhasil disimpan!', 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan pengaturan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeLogo = () => {
    setInvoiceSettings({ ...invoiceSettings, invoice_logo_url: '' })
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'business', label: 'Info Bisnis', icon: Building2 },
    { id: 'invoice', label: 'Invoice', icon: FileText },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Pengaturan</h2>
          <p className="text-gray-500 mt-1">Kelola preferensi aplikasi kamu</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64">
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Profil Saya</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs ${req.test.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                          {req.test.test(newPassword) ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div className="w-3 h-3 border border-gray-300 rounded-full" />
                          )}
                          {req.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                  <input
                    type="password"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      confirmPassword && newPassword !== confirmPassword ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Info Bisnis</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis / Company</label>
                  <input
                    type="text"
                    value={business.name}
                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    value={business.address}
                    onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                    <input
                      type="text"
                      value={business.phone}
                      onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={business.email}
                      onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={business.logo_url}
                    onChange={(e) => setBusiness({ ...business, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {business.logo_url && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg inline-block">
                      <img src={business.logo_url} alt="Logo" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings Tab */}
          {activeTab === 'invoice' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Pengaturan Invoice</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prefix Invoice</label>
                    <input
                      type="text"
                      value={invoiceSettings.prefix}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                      placeholder="INV"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Contoh: INV, INV/, INV-, INVOICE/</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Mulai</label>
                    <input
                      type="number"
                      value={invoiceSettings.starting_number}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, starting_number: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Uang</label>
                  <select
                    value={invoiceSettings.currency}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, currency: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IDR">IDR - Rupiah Indonesia</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Modern Template Preview */}
                  <button
                    onClick={() => setInvoiceSettings({ ...invoiceSettings, template: 'modern' })}
                    className={`relative p-4 rounded-xl border-2 transition ${
                      invoiceSettings.template === 'modern' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {invoiceSettings.template === 'modern' && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">Aktif</div>
                    )}
                    {/* Mini Modern Invoice Preview */}
                    <div className="bg-white rounded-lg border border-gray-100 p-3 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded"></div>
                          <div className="w-16 h-2 bg-blue-500 rounded"></div>
                        </div>
                        <div className="text-right">
                          <div className="w-12 h-2 bg-gray-300 rounded mb-1"></div>
                          <div className="w-16 h-1.5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <div className="w-20 h-1.5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-1.5 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <div className="w-24 h-1.5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-1.5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">Modern</p>
                      <p className="text-xs text-gray-500">Clean & professional dengan accent blue</p>
                    </div>
                  </button>

                  {/* Classic Template Preview */}
                  <button
                    onClick={() => setInvoiceSettings({ ...invoiceSettings, template: 'classic' })}
                    className={`relative p-4 rounded-xl border-2 transition ${
                      invoiceSettings.template === 'classic' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    {invoiceSettings.template === 'classic' && (
                      <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">Aktif</div>
                    )}
                    {/* Mini Classic Invoice Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                      <div className="border-b-2 border-teal-500 pb-2 mb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-teal-100 rounded-sm"></div>
                            <div className="w-14 h-2 bg-teal-600 rounded-sm"></div>
                          </div>
                          <div className="text-right">
                            <div className="text-teal-600 font-bold text-xs">INVOICE</div>
                            <div className="w-10 h-1 bg-gray-300 rounded mt-1"></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <div className="w-16 h-1.5 bg-teal-500 rounded"></div>
                          <div className="w-8 h-1.5 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <div className="w-20 h-1.5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-1.5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">Classic</p>
                      <p className="text-xs text-gray-500">Formal dengan accent teal/green</p>
                    </div>
                  </button>

                  {/* Minimal Template Preview */}
                  <button
                    onClick={() => setInvoiceSettings({ ...invoiceSettings, template: 'minimal' })}
                    className={`relative p-4 rounded-xl border-2 transition ${
                      invoiceSettings.template === 'minimal' ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {invoiceSettings.template === 'minimal' && (
                      <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">Aktif</div>
                    )}
                    {/* Mini Minimal Invoice Preview */}
                    <div className="bg-white p-3 mb-3">
                      <div className="flex justify-end mb-3">
                        <div className="text-right">
                          <div className="text-xl font-light text-gray-900">Invoice</div>
                          <div className="w-16 h-1 bg-gray-300 mt-1"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="w-24 h-1.5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-1.5 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-full h-px bg-gray-100"></div>
                        <div className="flex justify-between">
                          <div className="w-16 h-1.5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-1.5 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">Minimal</p>
                      <p className="text-xs text-gray-500">Simple & elegant tanpa border</p>
                    </div>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa Invoice</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'id', label: 'Indonesia' },
                      { value: 'en', label: 'English' },
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setInvoiceSettings({ ...invoiceSettings, invoice_language: lang.value })}
                        className={`p-3 rounded-lg border-2 text-center transition ${
                          invoiceSettings.invoice_language === lang.value ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800">{lang.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo Invoice</label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {invoiceSettings.invoice_logo_url ? (
                    <div className="relative inline-block">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <img
                          src={invoiceSettings.invoice_logo_url}
                          alt="Invoice Logo"
                          className="h-20 max-w-[200px] object-contain"
                        />
                      </div>
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-sm"
                      >
                        <X size={14} />
                      </button>
                      <p className="text-xs text-gray-400 mt-2">Klik X untuk hapus</p>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition ${
                        uploading ? 'opacity-50 cursor-wait' : ''
                      }`}
                    >
                      {uploading ? (
                        <Loader2 size={32} className="mx-auto mb-2 animate-spin text-blue-500" />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Upload size={24} className="text-blue-500" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-700">
                        {uploading ? 'Mengupload...' : 'Klik untuk upload logo'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, atau GIF • Maksimal 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}