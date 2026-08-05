import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { FileText, Calendar, User, Phone, MapPin, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ReservationDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    setLoading(true);
    API.get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data.data);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Gagal mengambil detail reservasi');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan reservasi ini?')) return;
    setCancelling(true);
    setErrorMsg('');
    try {
      await API.patch(`/orders/${id}/status`, { status: 'CANCELLED' });
      fetchOrder();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal membatalkan reservasi');
    } finally {
      setCancelling(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">DRAFT</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">CONFIRMED</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">CANCELLED</span>;
      default:
        return <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-60 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Reservasi Tidak Ditemukan</h2>
        <p className="text-slate-500 mt-2">{errorMsg || 'Detail data reservasi gagal ditampilkan.'}</p>
        <Link to="/" className="mt-4 inline-block text-violet-600 font-semibold hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Detail Reservasi</h1>
          <p className="text-slate-600 mt-1">Nomor Reservasi: <span className="font-semibold text-slate-800">{order.reservation_number}</span></p>
        </div>
        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">Rincian Penyewa</h3>
            
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Nama Penyewa</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{order.nama_penyewa}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Nomor Telepon</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{order.nomor_telepon}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Alamat Asal</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{order.alamat}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">Kamar yang Dipesan</h3>
            
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.gambar ? (item.product.gambar.startsWith('http') ? item.product.gambar : `http://localhost:8080/${item.product.gambar}`) : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                        alt={item.product?.nama_kamar}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.product?.nama_kamar}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.product?.kategori}</p>
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <p className="font-semibold text-slate-900">{item.kuantitas} Kamar</p>
                    <p className="text-xs text-slate-500 mt-1">{formatRupiah(item.harga_per_bulan)} / bln</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">Rincian Pembayaran</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tanggal Order</span>
                <span className="font-semibold text-slate-800">
                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between items-end">
                <span className="text-slate-600">Total Tagihan / Bulan</span>
                <span className="text-lg font-extrabold text-violet-600">{formatRupiah(order.total_harga)}</span>
              </div>
            </div>
          </div>

          {(order.status === 'DRAFT' || order.status === 'CONFIRMED') && user && user.role !== 'admin' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-red-200 text-sm font-semibold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" /> {cancelling ? 'Membatalkan...' : 'Batalkan Reservasi'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
