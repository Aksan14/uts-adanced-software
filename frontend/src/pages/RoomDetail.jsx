import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function RoomDetail({ fetchCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => {
        setRoom(res.data.data);
      })
      .catch((err) => {
        setErrorMsg('Gagal mengambil data detail kamar');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      setErrorMsg('Admin tidak dapat menambahkan kamar ke keranjang');
      return;
    }

    setAdding(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post('/cart', {
        product_id: parseInt(id),
        kuantitas: qty,
      });
      setSuccessMsg('Kamar berhasil ditambahkan ke keranjang!');
      fetchCartCount();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menambahkan kamar ke keranjang');
    } finally {
      setAdding(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Kamar Tidak Ditemukan</h2>
        <Link to="/rooms" className="mt-4 inline-block text-violet-600 font-semibold hover:underline">
          Kembali ke Daftar Kamar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <Link to="/rooms" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Daftar Kamar
      </Link>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-5 h-5" /> {successMsg}
          <Link to="/cart" className="underline font-semibold ml-auto">Lihat Keranjang</Link>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        <div className="space-y-4">
          <div className="h-80 bg-slate-100 rounded-xl overflow-hidden shadow-inner">
            <img
              src={room.gambar ? (room.gambar.startsWith('http') ? room.gambar : `http://localhost:8080/${room.gambar}`) : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
              alt={room.nama_kamar}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  {room.kategori}
                </span>
                <h1 className="text-3xl font-bold text-slate-900 mt-2">{room.nama_kamar}</h1>
              </div>
            </div>

            <div className="text-2xl font-extrabold text-violet-600">
              {formatRupiah(room.harga_per_bulan)}
              <span className="text-sm font-normal text-slate-500"> / bulan</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-sm">Fasilitas Kamar:</h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {room.fasilitas}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-sm">Deskripsi Kamar:</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {room.deskripsi}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Stok Kamar Tersedia:</span>
              <span className={`font-bold ${room.stok > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {room.stok > 0 ? `${room.stok} Kamar` : 'Habis'}
              </span>
            </div>

            {room.stok > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-slate-800 font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(Math.min(10, room.stok), qty + 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-grow inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 shadow transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> {adding ? 'Menambahkan...' : 'Pesan Kamar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
