import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { Calendar, Eye, FileText, AlertCircle } from 'lucide-react';

export default function ReservationHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    API.get('/orders')
      .then((res) => {
        setOrders(res.data.data);
      })
      .catch((err) => {
        setErrorMsg('Gagal mengambil riwayat reservasi');
      })
      .finally(() => setLoading(false));
  }, []);

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
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">DRAFT</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">CONFIRMED</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Riwayat Reservasi</h1>
        <p className="text-slate-600 mt-2">Daftar semua reservasi kamar kos yang pernah Anda lakukan.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <FileText className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700">Belum Ada Riwayat Reservasi</h2>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">
            Anda belum melakukan pemesanan kamar kos apa pun di KosHub.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 shadow transition-colors"
          >
            Pesan Kamar Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">No. Reservasi</th>
                  <th className="px-6 py-4">Tanggal Pemesanan</th>
                  <th className="px-6 py-4">Nama Penyewa</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{order.reservation_number}</td>
                    <td className="px-6 py-4 inline-flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{order.nama_penyewa}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatRupiah(order.total_harga)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/reservations/${order.id}`}
                        className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-semibold text-xs"
                      >
                        <Eye className="w-4 h-4" /> Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
