package main

import (
	"log"

	"koshub/config"
	"koshub/controllers"
	"koshub/database"
	"koshub/migrations"
	"koshub/repository"
	"koshub/routes"
	"koshub/seed"
	"koshub/services"

	_ "koshub/docs"

	"github.com/labstack/echo/v4"
)

// @title KosHub API
// @version 1.0
// @description KosHub Boarding Room Reservation System API
// @host localhost:8080
// @BasePath /api
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	cfg := config.LoadConfig()

	db := database.ConnectDB(cfg)

	migrations.RunMigration(db)

	seed.SeedDB(db)

	userRepo := repository.NewUserRepository(db)
	prodRepo := repository.NewProductRepository(db)
	cartRepo := repository.NewCartRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	authService := services.NewAuthService(userRepo)
	prodService := services.NewProductService(prodRepo)
	cartService := services.NewCartService(cartRepo, prodRepo)
	orderService := services.NewOrderService(orderRepo, cartRepo, prodRepo)

	authCtrl := controllers.NewAuthController(authService, cfg)
	prodCtrl := controllers.NewProductController(prodService)
	cartCtrl := controllers.NewCartController(cartService)
	orderCtrl := controllers.NewOrderController(orderService)

	e := echo.New()

	routes.SetupRoutes(e, cfg, authCtrl, prodCtrl, cartCtrl, orderCtrl)

	log.Printf("Starting server on port %s...", cfg.Port)
	if err := e.Start(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
