import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { Search } from 'lucide-react';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/products')
      .then((res) => {
        setRooms(res.data.data);
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

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.nama_kamar.toLowerCase().includes(search.toLowerCase()) || 
                          room.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === '' || room.kategori === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Daftar Kamar Kos</h1>
        <p className="text-slate-600 mt-2">Cari dan pilih kamar kos terbaik yang sesuai dengan kebutuhan Anda.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kamar atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 rounded-lg text-sm text-slate-900"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 rounded-lg text-sm text-slate-900 bg-white"
          >
            <option value="">Semua Kategori</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-100 shadow-sm h-96 animate-pulse" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg">Tidak ada kamar kos yang cocok dengan pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
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
  );
}
