import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { Trash2, AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react';

export default function Cart({ fetchCartCount }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const loadCart = () => {
    setLoading(true);
    API.get('/cart')
      .then((res) => {
        setCart(res.data.data);
      })
      .catch((err) => {
        setErrorMsg('Gagal mengambil data keranjang');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (itemId, newQty, maxStock) => {
    if (newQty < 1) return;
    if (newQty > 10) {
      alert('Maksimal kuantitas adalah 10 kamar');
      return;
    }
    if (newQty > maxStock) {
      alert('Kuantitas melebihi stok kamar yang tersedia');
      return;
    }

    try {
      await API.put(`/cart/${itemId}`, { kuantitas: newQty });
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah kuantitas');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) return;
    try {
      await API.delete(`/cart/${itemId}`);
      loadCart();
      fetchCartCount();
    } catch (err) {
      alert('Gagal menghapus item');
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
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const items = cart?.cart_items || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Keranjang Reservasi</h1>
        <p className="text-slate-600 mt-2">Kelola daftar kamar kos yang ingin Anda pesan.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-700">Keranjang Anda Kosong</h2>
          <p className="text-slate-500 max-w-sm mx-auto text-sm">
            Anda belum menambahkan kamar kos ke keranjang. Silakan jelajahi daftar kamar kos kami.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 shadow transition-colors"
          >
            Cari Kamar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.gambar ? (item.product.gambar.startsWith('http') ? item.product.gambar : `http://localhost:8080/${item.product.gambar}`) : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product.nama_kamar}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.product.nama_kamar}</h3>
                    <p className="text-xs text-slate-400 mt-1">{item.product.kategori}</p>
                    <p className="text-sm font-bold text-violet-600 mt-2">{formatRupiah(item.product.harga_per_bulan)} / bln</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.kuantitas - 1, item.product.stok)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-0.5 text-slate-800 font-semibold text-sm">{item.kuantitas}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.kuantitas + 1, item.product.stok)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Subtotal</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{formatRupiah(item.kuantitas * item.product.harga_per_bulan)}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
            <h3 className="font-bold text-lg text-slate-900">Ringkasan Reservasi</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Total Kamar</span>
                <span className="font-semibold text-slate-900">
                  {items.reduce((acc, item) => acc + item.kuantitas, 0)} Unit
                </span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between items-end">
                <span className="text-slate-600">Total Harga / Bulan</span>
                <span className="text-xl font-extrabold text-violet-600">
                  {formatRupiah(calculateTotal())}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 shadow transition-all duration-200 cursor-pointer"
            >
              Lanjutkan ke Checkout <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
