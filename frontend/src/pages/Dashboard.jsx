import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { ArrowRight, Bed, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/products')
      .then((res) => {
        setFeaturedRooms(res.data.data.slice(0, 3));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-16 pb-16">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white py-24 px-6 sm:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-violet-400" /> Reservasi Kos Jadi Lebih Mudah
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Temukan Kamar Kos Impian Anda Bersama <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">KosHub</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Platform modern untuk mencari, memesan, dan mengelola reservasi kamar kos secara instan dan 100% online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Cari Kamar Kos <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">Mengapa Memilih KosHub?</h2>
          <p className="text-slate-600">Layanan reservasi dengan berbagai keunggulan untuk kenyamanan Anda.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl inline-block">
              <Bed className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Fasilitas Lengkap</h3>
            <p className="text-slate-600">Setiap kamar kos dilengkapi AC, WiFi, kamar mandi dalam, kasur berkualitas tinggi, dan lemari pakaian.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl inline-block">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Reservasi Aman & Tepercaya</h3>
            <p className="text-slate-600">Sistem reservasi real-time yang memastikan kamar kos yang Anda pesan sudah terisi secara resmi.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl inline-block">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Proses Cepat & Mudah</h3>
            <p className="text-slate-600">Pilih kamar, masukkan ke keranjang, isi data diri penyewa, dan lakukan reservasi instan tanpa ribet.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Kamar Kos Terbaru</h2>
            <p className="text-slate-600 mt-2">Daftar kamar terpopuler yang siap untuk dihuni.</p>
          </div>
          <Link to="/rooms" className="text-violet-600 font-semibold hover:text-violet-700 flex items-center transition-colors">
            Lihat Semua <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 shadow-sm h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
                <div className="h-48 bg-slate-100 relative">
                  <img
                    src={room.gambar ? (room.gambar.startsWith('http') ? room.gambar : `http://localhost:8080/${room.gambar}`) : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                    alt={room.nama_kamar}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm text-xs font-bold text-slate-700">
                    {room.kategori}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{room.nama_kamar}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{room.deskripsi}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 font-medium">Stok Tersedia:</span>
                      <span className={`font-semibold ${room.stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {room.stok > 0 ? `${room.stok} Kamar` : 'Habis'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className="text-xl font-bold text-violet-600">{formatRupiah(room.harga_per_bulan)}<span className="text-xs font-normal text-slate-500">/bln</span></span>
                      <Link
                        to={`/rooms/${room.id}`}
                        className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
