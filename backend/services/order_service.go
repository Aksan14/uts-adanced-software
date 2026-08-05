package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"koshub/dto"
	"koshub/models"
	"koshub/repository"
)

type OrderService interface {
	Checkout(userID uint, req dto.OrderRequest) (*models.Order, error)
	GetOrderByID(userID uint, role string, orderID uint) (*models.Order, error)
	GetMyOrders(userID uint) ([]models.Order, error)
	GetAllOrders() ([]models.Order, error)
	UpdateOrderStatus(orderID uint, newStatus string) (*models.Order, error)
}

type orderService struct {
	orderRepo   repository.OrderRepository
	cartRepo    repository.CartRepository
	productRepo repository.ProductRepository
}

func NewOrderService(orderRepo repository.OrderRepository, cartRepo repository.CartRepository, productRepo repository.ProductRepository) OrderService {
	return &orderService{orderRepo, cartRepo, productRepo}
}

func generateReservationNumber() string {
	now := time.Now()
	nBig, err := rand.Int(rand.Reader, big.NewInt(9000))
	randNum := 1000
	if err == nil {
		randNum = int(nBig.Int64()) + 1000
	}
	return fmt.Sprintf("RES-%s-%d", now.Format("20060102"), randNum)
}

func (s *orderService) Checkout(userID uint, req dto.OrderRequest) (*models.Order, error) {
	if req.NamaPenyewa == "" {
		return nil, errors.New("nama penyewa wajib diisi")
	}
	if req.NomorTelepon == "" {
		return nil, errors.New("nomor telepon wajib diisi")
	}
	if req.Alamat == "" {
		return nil, errors.New("alamat wajib diisi")
	}

	cart, err := s.cartRepo.FindByUserID(userID)
	if err != nil || len(cart.CartItems) == 0 {
		return nil, errors.New("keranjang belanja kosong")
	}

	var totalHarga float64
	var orderItems []models.OrderItem

	for _, item := range cart.CartItems {
		product, err := s.productRepo.FindByID(item.ProductID)
		if err != nil {
			return nil, fmt.Errorf("kamar %d tidak ditemukan", item.ProductID)
		}
		if product.Stok < item.Kuantitas {
			return nil, fmt.Errorf("stok kamar %s tidak mencukupi (sisa %d)", product.NamaKamar, product.Stok)
		}

		totalHarga += product.HargaPerBulan * float64(item.Kuantitas)

		orderItems = append(orderItems, models.OrderItem{
			ProductID:     item.ProductID,
			Kuantitas:     item.Kuantitas,
			HargaPerBulan: product.HargaPerBulan,
		})
	}

	order := &models.Order{
		ReservationNumber: generateReservationNumber(),
		UserID:            userID,
		NamaPenyewa:       req.NamaPenyewa,
		NomorTelepon:      req.NomorTelepon,
		Alamat:            req.Alamat,
		TotalHarga:        totalHarga,
		Status:            "DRAFT",
		OrderItems:        orderItems,
	}

	if err := s.orderRepo.Create(order); err != nil {
		return nil, err
	}

	for _, item := range order.OrderItems {
		product, _ := s.productRepo.FindByID(item.ProductID)
		product.Stok -= item.Kuantitas
		_ = s.productRepo.Update(product)
	}

	_ = s.cartRepo.ClearCart(cart.ID)

	return s.orderRepo.FindByID(order.ID)
}

func (s *orderService) GetOrderByID(userID uint, role string, orderID uint) (*models.Order, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("reservasi tidak ditemukan")
	}

	if role != "admin" && order.UserID != userID {
		return nil, errors.New("akses ditolak")
	}

	return order, nil
}

func (s *orderService) GetMyOrders(userID uint) ([]models.Order, error) {
	return s.orderRepo.FindByUserID(userID)
}

func (s *orderService) GetAllOrders() ([]models.Order, error) {
	return s.orderRepo.FindAll()
}

func (s *orderService) UpdateOrderStatus(orderID uint, newStatus string) (*models.Order, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		return nil, errors.New("reservasi tidak ditemukan")
	}

	currentStatus := order.Status
	if currentStatus == newStatus {
		return order, nil
	}

	isValid := false
	if currentStatus == "DRAFT" && (newStatus == "CONFIRMED" || newStatus == "CANCELLED") {
		isValid = true
	} else if currentStatus == "CONFIRMED" && (newStatus == "COMPLETED" || newStatus == "CANCELLED") {
		isValid = true
	}

	if !isValid {
		return nil, fmt.Errorf("transisi status dari %s ke %s tidak valid", currentStatus, newStatus)
	}

	if err := s.orderRepo.UpdateStatus(orderID, newStatus); err != nil {
		return nil, err
	}

	if newStatus == "CANCELLED" {
		for _, item := range order.OrderItems {
			product, err := s.productRepo.FindByID(item.ProductID)
			if err == nil {
				product.Stok += item.Kuantitas
				_ = s.productRepo.Update(product)
			}
		}
	}

	return s.orderRepo.FindByID(orderID)
}
