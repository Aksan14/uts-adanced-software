package repository

import (
	"errors"
	"koshub/models"

	"gorm.io/gorm"
)

type CartRepository interface {
	FindByUserID(userID uint) (*models.Cart, error)
	GetOrCreateCart(userID uint) (*models.Cart, error)
	FindItemByID(itemID uint) (*models.CartItem, error)
	AddItem(cartID uint, productID uint, qty int) (*models.CartItem, error)
	UpdateItem(itemID uint, qty int) (*models.CartItem, error)
	DeleteItem(itemID uint) error
	ClearCart(cartID uint) error
}

type cartRepository struct {
	db *gorm.DB
}

func NewCartRepository(db *gorm.DB) CartRepository {
	return &cartRepository{db}
}

func (r *cartRepository) FindByUserID(userID uint) (*models.Cart, error) {
	var cart models.Cart
	err := r.db.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		return nil, err
	}
	return &cart, nil
}

func (r *cartRepository) GetOrCreateCart(userID uint) (*models.Cart, error) {
	var cart models.Cart
	err := r.db.Where("user_id = ?", userID).First(&cart).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			cart = models.Cart{UserID: userID}
			if err := r.db.Create(&cart).Error; err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	return r.FindByUserID(userID)
}

func (r *cartRepository) FindItemByID(itemID uint) (*models.CartItem, error) {
	var item models.CartItem
	err := r.db.Preload("Product").First(&item, itemID).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *cartRepository) AddItem(cartID uint, productID uint, qty int) (*models.CartItem, error) {
	var item models.CartItem
	err := r.db.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&item).Error
	if err == nil {
		item.Kuantitas += qty
		if err := r.db.Save(&item).Error; err != nil {
			return nil, err
		}
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		item = models.CartItem{
			CartID:    cartID,
			ProductID: productID,
			Kuantitas: qty,
		}
		if err := r.db.Create(&item).Error; err != nil {
			return nil, err
		}
	} else {
		return nil, err
	}
	return r.FindItemByID(item.ID)
}

func (r *cartRepository) UpdateItem(itemID uint, qty int) (*models.CartItem, error) {
	var item models.CartItem
	if err := r.db.First(&item, itemID).Error; err != nil {
		return nil, err
	}
	item.Kuantitas = qty
	if err := r.db.Save(&item).Error; err != nil {
		return nil, err
	}
	return r.FindItemByID(itemID)
}

func (r *cartRepository) DeleteItem(itemID uint) error {
	return r.db.Delete(&models.CartItem{}, itemID).Error
}

func (r *cartRepository) ClearCart(cartID uint) error {
	return r.db.Where("cart_id = ?", cartID).Delete(&models.CartItem{}).Error
}
