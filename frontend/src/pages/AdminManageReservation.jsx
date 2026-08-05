import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import API from '../api';
import { Eye, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminManageReservation() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadReservations = () => {
    setLoading(true);
    API.get('/orders')
      .then((res) => {
        setOrders(res.data.data);
      })
      .catch((err) => {
        setErrorMsg('Gagal mengambil data reservasi');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      setSuccessMsg(`Status reservasi #${orderId} berhasil diperbarui menjadi ${newStatus}`);
      loadReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui status');
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
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-60 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Kelola Reservasi</h1>
          <p className="text-slate-600 mt-2">Halaman administrasi untuk memverifikasi dan mengubah status reservasi kamar kos.</p>
        </div>
        <button
          onClick={loadReservations}
          className="inline-flex items-center p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">Belum ada data reservasi dari penyewa.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">No. Reservasi</th>
                  <th className="px-6 py-4">Penyewa</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Tanggal Order</th>
                  <th className="px-6 py-4">Status Saat Ini</th>
                  <th className="px-6 py-4">Perbarui Status</th>
                  <th className="px-6 py-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{order.reservation_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>{order.nama_penyewa}</div>
                      <div className="text-xs text-slate-400 font-normal">{order.nomor_telepon}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-violet-600">{formatRupiah(order.total_harga)}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">
                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' ? (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                        >
                          <option value="DRAFT">Set DRAFT</option>
                          <option value="CONFIRMED">Set CONFIRMED</option>
                          <option value="COMPLETED">Set COMPLETED</option>
                          <option value="CANCELLED">Set CANCELLED</option>
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Terkunci</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RouterLink
                        to={`/reservations/${order.id}`}
                        className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-semibold text-xs"
                      >
                        <Eye className="w-4 h-4" /> Lihat
                      </RouterLink>
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
