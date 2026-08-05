package dto

type CartItemRequest struct {
	ProductID uint `json:"product_id" validate:"required"`
	Kuantitas int  `json:"kuantitas" validate:"required,min=1,max=10"`
}

type CartItemUpdateRequest struct {
	Kuantitas int `json:"kuantitas" validate:"required,min=1,max=10"`
}
