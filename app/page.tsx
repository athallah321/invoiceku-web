import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-full bg-white">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img
                src="http://localhost:8000/logo.png"
                alt="Invoiceku"
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-gray-900">Invoiceku</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#fitur" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
                Fitur
              </a>
              <a href="#harga" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
                Harga
              </a>
              <a href="#testimonial" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
                Testimonial
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium hidden sm:block">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm shadow-blue-600/20"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 px-4">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Solusi Invoice #1 di Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Kelola Invoice<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mudah & Profesional
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Buat, kirim, dan lacak invoice dalam hitungan menit.<br className="hidden sm:block" />
            Tingkatkan cash flow bisnis kamu dengan Invoiceku.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              Mulai Gratis Sekarang
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#fitur"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 pt-16 border-t border-gray-100">
            <div>
              <p className="text-3xl font-bold text-gray-900">10K+</p>
              <p className="text-gray-500 text-sm">Invoice Dibuat</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">5K+</p>
              <p className="text-gray-500 text-sm">User Aktif</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-gray-500 text-sm">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logos/Partners */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-400 text-sm mb-8">Dipercaya oleh bisnis dari berbagai industri</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50">
            {['Tech Startup', 'Digital Agency', 'Freelancer', 'Retail', 'Consulting'].map((brand) => (
              <span key={brand} className="text-gray-400 font-semibold text-sm">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Fitur</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kelola invoice bisnis kamu dengan fitur lengkap yang dirancang untuk kemudahan dan efisiensi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Buat Invoice Instan",
                desc: "Template profesional dengan desain modern yang siap pakai",
                icon: "📄",
                color: "bg-blue-50 text-blue-600"
              },
              {
                title: "Tracking Real-time",
                desc: "Lacak status invoice: draft, terkirim, lunas, overdue",
                icon: "📊",
                color: "bg-green-50 text-green-600"
              },
              {
                title: "Kirim via Email",
                desc: "Kirim invoice langsung ke email klien dengan satu klik",
                icon: "✉️",
                color: "bg-purple-50 text-purple-600"
              },
              {
                title: "Laporan Analytics",
                desc: "Pantau keuangan bisnis dengan grafik yang jelas",
                icon: "📈",
                color: "bg-orange-50 text-orange-600"
              },
              {
                title: "Download PDF",
                desc: "Export invoice ke PDF profesional untuk arsip",
                icon: "📥",
                color: "bg-pink-50 text-pink-600"
              },
              {
                title: "Multi-user",
                desc: "Kolaborasi dengan tim dalam satu platform",
                icon: "👥",
                color: "bg-indigo-50 text-indigo-600"
              },
            ].map((fitur, i) => (
              <div key={i} className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 ${fitur.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {fitur.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{fitur.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{fitur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Cara Kerja</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Mulai dalam 3 Langkah
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Daftar Gratis", desc: "Buat akun dalam 30 detik. Tidak perlu kartu kredit." },
              { num: "02", title: "Buat Invoice", desc: "Pilih template, isi detail, generate invoice." },
              { num: "03", title: "Kirim & Paid", desc: "Kirim ke klien dan terima pembayaran." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Harga</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Paket yang Fleksibel
            </h2>
            <p className="text-gray-600">Mulai gratis, upgrade kapan saja sesuai kebutuhan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🆓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Gratis</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Rp 0</span>
                <span className="text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['10 Invoice/bulan', '1 User', 'Basic Template', 'Email Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center border-2 border-gray-200 text-gray-700 hover:border-gray-300 px-6 py-3 rounded-xl font-semibold transition">
                Mulai Gratis
              </Link>
            </div>

            {/* Pro - Popular */}
            <div className="bg-blue-600 p-8 rounded-2xl relative shadow-xl shadow-blue-600/20 transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">
                POPULER
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Pro</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Rp 99rb</span>
                <span className="text-blue-200">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited Invoice', '5 User', 'Semua Template', 'Email Tracking', 'Priority Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm">
                    <svg className="w-5 h-5 text-blue-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition shadow-lg">
                Berlangganan
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏢</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Rp 299rb</span>
                <span className="text-gray-500">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited Everything', 'Unlimited User', 'API Access', 'Custom Branding', 'Dedicated Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block text-center border-2 border-gray-200 text-gray-700 hover:border-gray-300 px-6 py-3 rounded-xl font-semibold transition">
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section id="testimonial" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonial</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Apa Kata Mereka
            </h2>
            <p className="text-gray-600">Dipakai oleh ribuan bisnis di Indonesia</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Budi Santoso",
                role: "Owner Toko Elektronik",
                avatar: "BS",
                text: "Invoiceku sangat membantu! Invoice saya jadi lebih profesional dan klien suka. Cash flow meningkat 30%!",
                rating: 5
              },
              {
                name: "Sarah Wijaya",
                role: "Freelancer Designer",
                avatar: "SW",
                text: "Gampang banget buat kirim invoice ke klien. Dulu ribet, sekarang tinggal klik kirim. Waktu saya hemat banyak!",
                rating: 5
              },
              {
                name: "Ahmad Rizki",
                role: "CEO Startup Tech",
                avatar: "AR",
                text: "Fitur analytics-nya membantu saya pantau keuangan bisnis dengan mudah. Reporting jadi lebih cepat.",
                rating: 5
              },
            ].map((testi, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(testi.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">"{testi.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {testi.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testi.name}</p>
                    <p className="text-gray-500 text-xs">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Siap Memulai?
          </h2>
          <p className="text-blue-100 mb-10 text-lg">
            Daftar sekarang dan buat invoice pertamamu dalam 5 menit.<br />
            Gratis selamanya untuk paket dasar.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold transition shadow-lg"
          >
            Daftar Gratis Sekarang
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Apakah gratis selamanya?", a: "Ya, paket Gratis akan selalu gratis dengan batasan 10 invoice per bulan." },
              { q: "Bagaimana cara upgrade ke paket Pro?", a: "Kamu bisa upgrade kapan saja dari dashboard pengaturan. Pembayaran bulanan." },
              { q: "Apakah bisa download invoice sebagai PDF?", a: "Ya, semua paket bisa download invoice sebagai PDF profesional." },
              { q: "Bagaimana cara kirim invoice via email?", a: "Cukup klik tombol 'Kirim Email' di halaman detail invoice. Email akan langsung terkirim ke klien." },
            ].map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="http://localhost:8000/logo.png"
                  alt="Invoiceku"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold text-white">Invoiceku</span>
              </div>
              <p className="text-sm leading-relaxed">Solusi invoice modern untuk bisnis Indonesia. Buat, kirim, dan pantau invoice dengan mudah.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produk</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#fitur" className="hover:text-white transition">Fitur</a></li>
                <li><a href="#harga" className="hover:text-white transition">Harga</a></li>
                <li><a href="#" className="hover:text-white transition">Template</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Kontak</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 Invoiceku. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}