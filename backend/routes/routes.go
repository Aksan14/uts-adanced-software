package routes

import (
	"koshub/config"
	"koshub/controllers"
	"koshub/middleware"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

func SetupRoutes(
	e *echo.Echo,
	cfg config.Config,
	authCtrl *controllers.AuthController,
	prodCtrl *controllers.ProductController,
	cartCtrl *controllers.CartController,
	orderCtrl *controllers.OrderController,
) {
	e.Use(echoMiddleware.Logger())
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE, echo.OPTIONS},
	}))

	e.GET("/swagger/*", echoSwagger.WrapHandler)
	e.Static("/uploads", "uploads")

	api := e.Group("/api")
	api.POST("/login", authCtrl.Login)

	api.GET("/products", prodCtrl.GetAll)
	api.GET("/products/:id", prodCtrl.GetByID)

	authMiddleware := middleware.JWTMiddleware(cfg.JWTSecret)
	adminMiddleware := middleware.RequireAdmin()

	api.POST("/products", prodCtrl.Create, authMiddleware, adminMiddleware)
	api.PUT("/products/:id", prodCtrl.Update, authMiddleware, adminMiddleware)
	api.DELETE("/products/:id", prodCtrl.Delete, authMiddleware, adminMiddleware)
	api.POST("/upload", prodCtrl.Upload, authMiddleware, adminMiddleware)

	api.GET("/cart", cartCtrl.Get, authMiddleware)
	api.POST("/cart", cartCtrl.Add, authMiddleware)
	api.PUT("/cart/:id", cartCtrl.Update, authMiddleware)
	api.DELETE("/cart/:id", cartCtrl.Delete, authMiddleware)

	api.POST("/orders", orderCtrl.Checkout, authMiddleware)
	api.GET("/orders/:id", orderCtrl.GetByID, authMiddleware)
	api.GET("/orders", orderCtrl.GetOrders, authMiddleware)
	api.PATCH("/orders/:id/status", orderCtrl.UpdateStatus, authMiddleware)
}
