package dto

type ProductRequest struct {
	NamaKamar     string  `json:"nama_kamar" validate:"required"`
	HargaPerBulan float64 `json:"harga_per_bulan" validate:"required,gt=0"`
	Stok          int     `json:"stok" validate:"gte=0"`
	Kategori      string  `json:"kategori"`
	Fasilitas     string  `json:"fasilitas"`
	Deskripsi     string  `json:"deskripsi"`
	Gambar        string  `json:"gambar"`
}
