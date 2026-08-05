package services

import (
	"testing"

	"koshub/dto"
	"koshub/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type mockProductRepository struct {
	db *gorm.DB
}

func (m *mockProductRepository) FindAll() ([]models.Product, error) {
	var products []models.Product
	err := m.db.Find(&products).Error
	return products, err
}

func (m *mockProductRepository) FindByID(id uint) (*models.Product, error) {
	var product models.Product
	err := m.db.First(&product, id).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (m *mockProductRepository) Create(product *models.Product) error {
	return m.db.Create(product).Error
}

func (m *mockProductRepository) Update(product *models.Product) error {
	return m.db.Save(product).Error
}

func (m *mockProductRepository) Delete(id uint) error {
	return m.db.Delete(&models.Product{}, id).Error
}

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}
	err = db.AutoMigrate(&models.Product{}, &models.User{}, &models.Cart{}, &models.CartItem{}, &models.Order{}, &models.OrderItem{})
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}
	return db
}

func TestCreateProduct_Validations(t *testing.T) {
	db := setupTestDB(t)
	repo := &mockProductRepository{db: db}
	service := NewProductService(repo)

	tests := []struct {
		name        string
		req         dto.ProductRequest
		expectError bool
		errMsg      string
	}{
		{
			name: "Valid Product",
			req: dto.ProductRequest{
				NamaKamar:     "Kamar Test AC",
				HargaPerBulan: 1000000,
				Stok:          5,
				Kategori:      "Standard",
			},
			expectError: false,
		},
		{
			name: "Invalid Empty Name",
			req: dto.ProductRequest{
				NamaKamar:     "",
				HargaPerBulan: 1000000,
				Stok:          5,
				Kategori:      "Standard",
			},
			expectError: true,
			errMsg:      "nama kamar wajib diisi",
		},
		{
			name: "Invalid Zero Price",
			req: dto.ProductRequest{
				NamaKamar:     "Kamar A",
				HargaPerBulan: 0,
				Stok:          5,
				Kategori:      "Standard",
			},
			expectError: true,
			errMsg:      "harga harus lebih dari nol",
		},
		{
			name: "Invalid Negative Price",
			req: dto.ProductRequest{
				NamaKamar:     "Kamar B",
				HargaPerBulan: -500,
				Stok:          5,
				Kategori:      "Standard",
			},
			expectError: true,
			errMsg:      "harga harus lebih dari nol",
		},
		{
			name: "Invalid Negative Stock",
			req: dto.ProductRequest{
				NamaKamar:     "Kamar C",
				HargaPerBulan: 100000,
				Stok:          -1,
				Kategori:      "Standard",
			},
			expectError: true,
			errMsg:      "stok tidak boleh negatif",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := service.CreateProduct(tt.req)
			if tt.expectError {
				if err == nil {
					t.Errorf("expected error, got nil")
				} else if err.Error() != tt.errMsg {
					t.Errorf("expected error message '%s', got '%s'", tt.errMsg, err.Error())
				}
			} else {
				if err != nil {
					t.Errorf("unexpected error: %v", err)
				}
			}
		})
	}
}
