import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import API from '../api';
import { Plus, Edit2, Trash2, X, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminManageRoom() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const loadRooms = () => {
    setLoading(true);
    API.get('/products')
      .then((res) => {
        setRooms(res.data.data);
      })
      .catch(() => setErrorMsg('Gagal mengambil data kamar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    reset({
      nama_kamar: '',
      harga_per_bulan: '',
      stok: '',
      kategori: 'Standard',
      fasilitas: '',
      deskripsi: '',
      gambar: '',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setUploadError('');
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    reset({
      nama_kamar: room.nama_kamar,
      harga_per_bulan: room.harga_per_bulan,
      stok: room.stok,
      kategori: room.kategori,
      fasilitas: room.fasilitas,
      deskripsi: room.deskripsi,
      gambar: room.gambar,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setUploadError('');
    setShowModal(true);
  };

  const gambarValue = watch('gambar');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data && res.data.status) {
        setValue('gambar', res.data.data.path);
      } else {
        setUploadError(res.data?.message || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080/${path}`;
  };

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    const payload = {
      nama_kamar: data.nama_kamar,
      harga_per_bulan: parseFloat(data.harga_per_bulan),
      stok: parseInt(data.stok),
      kategori: data.kategori,
      fasilitas: data.fasilitas,
      deskripsi: data.deskripsi,
      gambar: data.gambar || '',
    };

    try {
      if (editingRoom) {
        await API.put(`/products/${editingRoom.id}`, payload);
        setSuccessMsg('Kamar kos berhasil diperbarui');
      } else {
        await API.post('/products', payload);
        setSuccessMsg('Kamar kos baru berhasil ditambahkan');
      }
      setShowModal(false);
      loadRooms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan sistem');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kamar kos ini?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.delete(`/products/${id}`);
      setSuccessMsg('Kamar kos berhasil dihapus');
      loadRooms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus kamar kos');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Kelola Kamar Kos</h1>
          <p className="text-slate-600 mt-2">Halaman administrasi untuk menambah, mengubah, dan menghapus daftar kamar kos.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 shadow transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Kamar Baru
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-96 animate-pulse" />
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">Belum ada data kamar kos. Silakan klik tombol "Tambah Kamar Baru".</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Gambar</th>
                  <th className="px-6 py-4">Nama Kamar</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga / Bulan</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={room.gambar ? (room.gambar.startsWith('http') ? room.gambar : `http://localhost:8080/${room.gambar}`) : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                          alt={room.nama_kamar}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{room.nama_kamar}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {room.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-violet-600">{formatRupiah(room.harga_per_bulan)}</td>
                    <td className="px-6 py-4 font-medium">{room.stok} Unit</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="inline-flex p-1.5 text-slate-500 hover:text-violet-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="inline-flex p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingRoom ? 'Ubah Data Kamar Kos' : 'Tambah Kamar Kos Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kamar</label>
                <input
                  type="text"
                  {...register('nama_kamar', { required: 'Nama kamar wajib diisi' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Kamar Deluxe AC 01"
                />
                {errors.nama_kamar && <p className="mt-1 text-xs text-red-600">{errors.nama_kamar.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga / Bulan</label>
                  <input
                    type="number"
                    {...register('harga_per_bulan', { 
                      required: 'Harga wajib diisi',
                      min: { value: 1, message: 'Harga harus lebih dari nol' }
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="1200000"
                  />
                  {errors.harga_per_bulan && <p className="mt-1 text-xs text-red-600">{errors.harga_per_bulan.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok Kamar</label>
                  <input
                    type="number"
                    {...register('stok', { 
                      required: 'Stok wajib diisi',
                      min: { value: 0, message: 'Stok tidak boleh negatif' }
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="5"
                  />
                  {errors.stok && <p className="mt-1 text-xs text-red-600">{errors.stok.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  {...register('kategori')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fasilitas</label>
                <input
                  type="text"
                  {...register('fasilitas', { required: 'Fasilitas wajib diisi' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="AC, WiFi, Kamar Mandi Dalam, Kasur, Lemari"
                />
                {errors.fasilitas && <p className="mt-1 text-xs text-red-600">{errors.fasilitas.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows="3"
                  {...register('deskripsi', { required: 'Deskripsi wajib diisi' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Kamar kos premium bernuansa minimalis..."
                ></textarea>
                {errors.deskripsi && <p className="mt-1 text-xs text-red-600">{errors.deskripsi.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gambar Kamar Kos</label>
                
                {gambarValue ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(gambarValue)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="text-xs text-slate-500 max-w-[200px] truncate">
                        {gambarValue}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValue('gambar', '')}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-violet-400 transition-colors relative">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-slate-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500">
                          <span>Unggah file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">atau seret dan lepas</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, JPEG hingga 5MB</p>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-white/85 flex items-center justify-center rounded-xl">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-semibold text-slate-600">Mengunggah...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
                <input type="hidden" {...register('gambar')} />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-violet-600 hover:bg-violet-700 cursor-pointer shadow"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
