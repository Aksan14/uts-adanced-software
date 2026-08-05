package services

import (
	"errors"

	"koshub/dto"
	"koshub/models"
	"koshub/repository"
)

type CartService interface {
	GetCart(userID uint) (*models.Cart, error)
	AddToCart(userID uint, req dto.CartItemRequest) (*models.CartItem, error)
	UpdateCartItem(userID uint, itemID uint, req dto.CartItemUpdateRequest) (*models.CartItem, error)
	DeleteCartItem(userID uint, itemID uint) error
}

type cartService struct {
	cartRepo    repository.CartRepository
	productRepo repository.ProductRepository
}

func NewCartService(cartRepo repository.CartRepository, productRepo repository.ProductRepository) CartService {
	return &cartService{cartRepo, productRepo}
}

func (s *cartService) GetCart(userID uint) (*models.Cart, error) {
	return s.cartRepo.GetOrCreateCart(userID)
}

func (s *cartService) AddToCart(userID uint, req dto.CartItemRequest) (*models.CartItem, error) {
	if req.Kuantitas <= 0 {
		return nil, errors.New("kuantitas tidak boleh nol atau negatif")
	}
	if req.Kuantitas > 10 {
		return nil, errors.New("maksimal kuantitas adalah 10 kamar")
	}

	product, err := s.productRepo.FindByID(req.ProductID)
	if err != nil {
		return nil, errors.New("kamar tidak ditemukan")
	}

	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil {
		return nil, err
	}

	existingQty := 0
	for _, item := range cart.CartItems {
		if item.ProductID == req.ProductID {
			existingQty = item.Kuantitas
			break
		}
	}

	totalWanted := existingQty + req.Kuantitas
	if totalWanted > 10 {
		return nil, errors.New("total kuantitas kamar di keranjang melebihi batas maksimal 10")
	}
	if totalWanted > product.Stok {
		return nil, errors.New("kuantitas melebihi stok kamar yang tersedia")
	}

	return s.cartRepo.AddItem(cart.ID, req.ProductID, req.Kuantitas)
}

func (s *cartService) UpdateCartItem(userID uint, itemID uint, req dto.CartItemUpdateRequest) (*models.CartItem, error) {
	if req.Kuantitas <= 0 {
		return nil, errors.New("kuantitas tidak boleh nol atau negatif")
	}
	if req.Kuantitas > 10 {
		return nil, errors.New("maksimal kuantitas adalah 10 kamar")
	}

	item, err := s.cartRepo.FindItemByID(itemID)
	if err != nil {
		return nil, errors.New("item keranjang tidak ditemukan")
	}

	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil || item.CartID != cart.ID {
		return nil, errors.New("akses ditolak")
	}

	product, err := s.productRepo.FindByID(item.ProductID)
	if err != nil {
		return nil, errors.New("kamar tidak ditemukan")
	}

	if req.Kuantitas > product.Stok {
		return nil, errors.New("kuantitas melebihi stok kamar yang tersedia")
	}

	return s.cartRepo.UpdateItem(itemID, req.Kuantitas)
}

func (s *cartService) DeleteCartItem(userID uint, itemID uint) error {
	item, err := s.cartRepo.FindItemByID(itemID)
	if err != nil {
		return errors.New("item keranjang tidak ditemukan")
	}

	cart, err := s.cartRepo.GetOrCreateCart(userID)
	if err != nil || item.CartID != cart.ID {
		return errors.New("akses ditolak")
	}

	return s.cartRepo.DeleteItem(itemID)
}
