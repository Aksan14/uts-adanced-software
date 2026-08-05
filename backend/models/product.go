package models

import "time"

type Product struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	NamaKamar     string    `gorm:"type:varchar(100);not null" json:"nama_kamar"`
	HargaPerBulan float64   `gorm:"type:decimal(15,2);not null" json:"harga_per_bulan"`
	Stok          int       `gorm:"not null" json:"stok"`
	Kategori      string    `gorm:"type:varchar(50)" json:"kategori"`
	Fasilitas     string    `gorm:"type:text" json:"fasilitas"`
	Deskripsi     string    `gorm:"type:text" json:"deskripsi"`
	Gambar        string    `gorm:"type:varchar(255)" json:"gambar"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
