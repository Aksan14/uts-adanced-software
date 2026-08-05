import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Checkout({ fetchCartCount }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    API.get('/cart')
      .then((res) => {
        setCart(res.data.data);
      })
      .catch((err) => {
        setErrorMsg('Gagal mengambil data keranjang');
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const response = await API.post('/orders', {
        nama_penyewa: data.nama_penyewa,
        nomor_telepon: data.nomor_telepon,
        alamat: data.alamat,
      });
      fetchCartCount();
      const orderId = response.data.data.id;
      navigate(`/reservations/${orderId}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Proses checkout gagal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const calculateTotal = () => {
    if (!cart || !cart.cart_items) return 0;
    return cart.cart_items.reduce((acc, item) => acc + (item.kuantitas * item.product.harga_per_bulan), 0);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-60 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const items = cart?.cart_items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Keranjang Anda Kosong</h2>
        <p className="text-slate-500">Silakan tambahkan kamar kos terlebih dahulu.</p>
        <Link to="/rooms" className="text-violet-600 font-semibold hover:underline">Jelajahi Kamar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <Link to="/cart" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Keranjang
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Checkout Reservasi</h1>
        <p className="text-slate-600 mt-2">Lengkapi data diri penyewa untuk menyelesaikan reservasi kamar.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-xl text-slate-900 pb-3 border-b border-slate-100">Informasi Penyewa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lengkap Penyewa
                </label>
                <input
                  type="text"
                  {...register('nama_penyewa', { required: 'Nama lengkap wajib diisi' })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.nama_penyewa ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Asep Sunandar"
                />
                {errors.nama_penyewa && (
                  <p className="mt-1 text-xs text-red-600">{errors.nama_penyewa.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  {...register('nomor_telepon', { required: 'Nomor telepon wajib diisi' })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.nomor_telepon ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="081234567890"
                />
                {errors.nomor_telepon && (
                  <p className="mt-1 text-xs text-red-600">{errors.nomor_telepon.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alamat Asal Penyewa
                </label>
                <textarea
                  rows="3"
                  {...register('alamat', { required: 'Alamat wajib diisi' })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.alamat ? 'border-red-300' : 'border-slate-200'
                  }`}
                  placeholder="Jl. Raya Bandung No. 12"
                ></textarea>
                {errors.alamat && (
                  <p className="mt-1 text-xs text-red-600">{errors.alamat.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> {submitting ? 'Memproses Reservasi...' : 'Konfirmasi Reservasi'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
          <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">Kamar Dipilih</h3>
          
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 justify-between items-start text-sm">
                <div>
                  <h4 className="font-semibold text-slate-800">{item.product.nama_kamar}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.kuantitas} Kamar x {formatRupiah(item.product.harga_per_bulan)}</p>
                </div>
                <span className="font-bold text-slate-900">{formatRupiah(item.kuantitas * item.product.harga_per_bulan)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
            <div className="flex justify-between items-end">
              <span className="text-slate-600 font-medium">Total Tagihan / Bulan</span>
              <span className="text-xl font-extrabold text-violet-600">
                {formatRupiah(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
