package dto

type OrderRequest struct {
	NamaPenyewa  string `json:"nama_penyewa" validate:"required"`
	NomorTelepon string `json:"nomor_telepon" validate:"required"`
	Alamat       string `json:"alamat" validate:"required"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" validate:"required"`
}
