package services

import (
	"testing"

	"koshub/dto"
	"koshub/models"

	"gorm.io/gorm"
)

type mockCartRepository struct {
	db *gorm.DB
}

func (m *mockCartRepository) FindByUserID(userID uint) (*models.Cart, error) {
	var cart models.Cart
	err := m.db.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (m *mockCartRepository) GetOrCreateCart(userID uint) (*models.Cart, error) {
	var cart models.Cart
	err := m.db.Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		cart = models.Cart{UserID: userID}
		m.db.Create(&cart)
	}
	return m.FindByUserID(userID)
}

func (m *mockCartRepository) FindItemByID(itemID uint) (*models.CartItem, error) {
	var item models.CartItem
	err := m.db.Preload("Product").First(&item, itemID).Error
	return &item, err
}

func (m *mockCartRepository) AddItem(cartID uint, productID uint, qty int) (*models.CartItem, error) {
	var item models.CartItem
	err := m.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error
	if err == nil {
		item.Kuantitas += qty
		m.db.Save(&item)
	} else {
		item = models.CartItem{
			CartID:    cartID,
			ProductID: productID,
			Kuantitas: qty,
		}
		m.db.Create(&item)
	}
	return m.FindItemByID(item.ID)
}

func (m *mockCartRepository) UpdateItem(itemID uint, qty int) (*models.CartItem, error) {
	var item models.CartItem
	m.db.First(&item, itemID)
	item.Kuantitas = qty
	m.db.Save(&item)
	return m.FindItemByID(itemID)
}

func (m *mockCartRepository) DeleteItem(itemID uint) error {
	return m.db.Delete(&models.CartItem{}, itemID).Error
}

func (m *mockCartRepository) ClearCart(cartID uint) error {
	return m.db.Where("cart_id = ?", cartID).Delete(&models.CartItem{}).Error
}

func TestAddToCart_Validations(t *testing.T) {
	db := setupTestDB(t)
	cartRepo := &mockCartRepository{db: db}
	prodRepo := &mockProductRepository{db: db}
	service := NewCartService(cartRepo, prodRepo)

	prod1 := models.Product{NamaKamar: "Kamar A", HargaPerBulan: 1000000, Stok: 5}
	db.Create(&prod1)
	prod2 := models.Product{NamaKamar: "Kamar B", HargaPerBulan: 1200000, Stok: 12}
	db.Create(&prod2)

	user := models.User{Nama: "Test User", Email: "test@gmail.com"}
	db.Create(&user)

	tests := []struct {
		name        string
		req         dto.CartItemRequest
		expectError bool
		errMsg      string
	}{
		{
			name: "Valid addition",
			req: dto.CartItemRequest{
				ProductID: prod1.ID,
				Kuantitas: 3,
			},
			expectError: false,
		},
		{
			name: "Invalid zero quantity",
			req: dto.CartItemRequest{
				ProductID: prod1.ID,
				Kuantitas: 0,
			},
			expectError: true,
			errMsg:      "kuantitas tidak boleh nol atau negatif",
		},
		{
			name: "Invalid negative quantity",
			req: dto.CartItemRequest{
				ProductID: prod1.ID,
				Kuantitas: -2,
			},
			expectError: true,
			errMsg:      "kuantitas tidak boleh nol atau negatif",
		},
		{
			name: "Invalid exceeds maximum limit (10)",
			req: dto.CartItemRequest{
				ProductID: prod2.ID,
				Kuantitas: 11,
			},
			expectError: true,
			errMsg:      "maksimal kuantitas adalah 10 kamar",
		},
		{
			name: "Invalid exceeds room stock",
			req: dto.CartItemRequest{
				ProductID: prod1.ID,
				Kuantitas: 6,
			},
			expectError: true,
			errMsg:      "kuantitas melebihi stok kamar yang tersedia",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := service.AddToCart(user.ID, tt.req)
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
