package models

import "time"

type Order struct {
	ID                uint        `gorm:"primaryKey" json:"id"`
	ReservationNumber string      `gorm:"type:varchar(50);unique;not null" json:"reservation_number"`
	UserID            uint        `gorm:"not null" json:"user_id"`
	User              User        `gorm:"foreignKey:UserID;constraint:OnDelete:RESTRICT;" json:"-"`
	NamaPenyewa       string      `gorm:"type:varchar(100);not null" json:"nama_penyewa"`
	NomorTelepon      string      `gorm:"type:varchar(20);not null" json:"nomor_telepon"`
	Alamat            string      `gorm:"type:text;not null" json:"alamat"`
	TotalHarga        float64     `gorm:"type:decimal(15,2);not null" json:"total_harga"`
	Status            string      `gorm:"type:varchar(20);default:'DRAFT'" json:"status"` // DRAFT, CONFIRMED, COMPLETED, CANCELLED
	OrderItems        []OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE;" json:"order_items"`
	CreatedAt         time.Time   `json:"created_at"`
	UpdatedAt         time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	OrderID       uint      `gorm:"not null" json:"order_id"`
	ProductID     uint      `gorm:"not null" json:"product_id"`
	Product       Product   `gorm:"foreignKey:ProductID;constraint:OnDelete:RESTRICT;" json:"product"`
	Kuantitas     int       `gorm:"not null" json:"kuantitas"`
	HargaPerBulan float64   `gorm:"type:decimal(15,2);not null" json:"harga_per_bulan"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
