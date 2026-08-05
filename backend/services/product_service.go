package services

import (
	"errors"

	"koshub/dto"
	"koshub/models"
	"koshub/repository"
)

type ProductService interface {
	GetAllProducts() ([]models.Product, error)
	GetProductByID(id uint) (*models.Product, error)
	CreateProduct(req dto.ProductRequest) (*models.Product, error)
	UpdateProduct(id uint, req dto.ProductRequest) (*models.Product, error)
	DeleteProduct(id uint) error
}

type productService struct {
	productRepo repository.ProductRepository
}

func NewProductService(productRepo repository.ProductRepository) ProductService {
	return &productService{productRepo}
}

func (s *productService) GetAllProducts() ([]models.Product, error) {
	return s.productRepo.FindAll()
}

func (s *productService) GetProductByID(id uint) (*models.Product, error) {
	return s.productRepo.FindByID(id)
}

func (s *productService) CreateProduct(req dto.ProductRequest) (*models.Product, error) {
	if req.NamaKamar == "" {
		return nil, errors.New("nama kamar wajib diisi")
	}
	if req.HargaPerBulan <= 0 {
		return nil, errors.New("harga harus lebih dari nol")
	}
	if req.Stok < 0 {
		return nil, errors.New("stok tidak boleh negatif")
	}

	product := &models.Product{
		NamaKamar:     req.NamaKamar,
		HargaPerBulan: req.HargaPerBulan,
		Stok:          req.Stok,
		Kategori:      req.Kategori,
		Fasilitas:     req.Fasilitas,
		Deskripsi:     req.Deskripsi,
		Gambar:        req.Gambar,
	}

	err := s.productRepo.Create(product)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (s *productService) UpdateProduct(id uint, req dto.ProductRequest) (*models.Product, error) {
	product, err := s.productRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("kamar tidak ditemukan")
	}

	if req.NamaKamar == "" {
		return nil, errors.New("nama kamar wajib diisi")
	}
	if req.HargaPerBulan <= 0 {
		return nil, errors.New("harga harus lebih dari nol")
	}
	if req.Stok < 0 {
		return nil, errors.New("stok tidak boleh negatif")
	}

	product.NamaKamar = req.NamaKamar
	product.HargaPerBulan = req.HargaPerBulan
	product.Stok = req.Stok
	product.Kategori = req.Kategori
	product.Fasilitas = req.Fasilitas
	product.Deskripsi = req.Deskripsi
	if req.Gambar != "" {
		product.Gambar = req.Gambar
	}

	err = s.productRepo.Update(product)
	if err != nil {
		return nil, err
	}
	return product, nil
}

func (s *productService) DeleteProduct(id uint) error {
	_, err := s.productRepo.FindByID(id)
	if err != nil {
		return errors.New("kamar tidak ditemukan")
	}
	return s.productRepo.Delete(id)
}
