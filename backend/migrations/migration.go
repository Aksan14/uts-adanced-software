package migrations

import (
	"log"

	"koshub/models"

	"gorm.io/gorm"
)

func RunMigration(db *gorm.DB) {
	log.Println("Running database migrations...")
	err := db.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Database migrations completed successfully.")
}
