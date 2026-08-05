package features

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"koshub/config"
	"koshub/controllers"
	"koshub/dto"
	"koshub/helper"
	"koshub/models"
	"koshub/repository"
	"koshub/routes"
	"koshub/services"

	"github.com/cucumber/godog"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type testContext struct {
	db           *gorm.DB
	echoEngine   *echo.Echo
	lastResponse *httptest.ResponseRecorder
	token        string
}

func (tc *testContext) reset() {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	db.AutoMigrate(&models.Product{}, &models.User{}, &models.Cart{}, &models.CartItem{}, &models.Order{}, &models.OrderItem{})
	tc.db = db

	tc.echoEngine = echo.New()
	cfg := config.Config{
		JWTSecret: "testsecretkeyforkoshub123!",
		Port:      "8080",
	}

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

	routes.SetupRoutes(tc.echoEngine, cfg, authCtrl, prodCtrl, cartCtrl, orderCtrl)

	tc.lastResponse = nil
	tc.token = ""
}

func (tc *testContext) aUserWithEmailAndPasswordExists(email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user := models.User{
		Nama:     "Test User",
		Email:    email,
		Password: string(hashedPassword),
		Role:     "user",
	}
	return tc.db.Create(&user).Error
}

func (tc *testContext) iSendAPOSTRequestToWithEmailAndPassword(url, email, password string) error {
	reqBody, _ := json.Marshal(dto.LoginRequest{
		Email:    email,
		Password: password,
	})

	req := httptest.NewRequest(http.MethodPost, url, bytes.NewBuffer(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()
	tc.echoEngine.ServeHTTP(rec, req)
	tc.lastResponse = rec
	return nil
}

func (tc *testContext) theResponseStatusCodeShouldBe(expectedCode int) error {
	if tc.lastResponse == nil {
		return errors.New("no response recorded")
	}
	if tc.lastResponse.Code != expectedCode {
		return fmt.Errorf("expected response status code %d, but got %d", expectedCode, tc.lastResponse.Code)
	}
	return nil
}

func (tc *testContext) theResponseMessageShouldBe(expectedMsg string) error {
	if tc.lastResponse == nil {
		return errors.New("no response recorded")
	}
	var res helper.Response
	if err := json.Unmarshal(tc.lastResponse.Body.Bytes(), &res); err != nil {
		return err
	}
	if res.Message != expectedMsg {
		return fmt.Errorf("expected response message '%s', but got '%s'", expectedMsg, res.Message)
	}
	return nil
}

func (tc *testContext) theResponseShouldContainAJWTToken() error {
	if tc.lastResponse == nil {
		return errors.New("no response recorded")
	}
	var res struct {
		Status  bool   `json:"status"`
		Message string `json:"message"`
		Data    struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	if err := json.Unmarshal(tc.lastResponse.Body.Bytes(), &res); err != nil {
		return err
	}
	if res.Data.Token == "" {
		return errors.New("response did not contain a JWT token")
	}
	tc.token = res.Data.Token
	return nil
}

func (tc *testContext) aRoomWithPriceAndStockExists(name string, price float64, stock int) error {
	product := models.Product{
		NamaKamar:     name,
		HargaPerBulan: price,
		Stok:          stock,
		Kategori:      "Standard",
		Fasilitas:     "WiFi",
		Deskripsi:     "Kamar standard",
	}
	return tc.db.Create(&product).Error
}

func (tc *testContext) iAmLoggedInAs(email string) error {
	var user models.User
	if err := tc.db.Where("email = ?", email).First(&user).Error; err != nil {
		err = tc.aUserWithEmailAndPasswordExists(email, "user123")
		if err != nil {
			return err
		}
		tc.db.Where("email = ?", email).First(&user)
	}

	token, err := helper.GenerateToken(user.ID, user.Role, "testsecretkeyforkoshub123!")
	if err != nil {
		return err
	}
	tc.token = token
	return nil
}

func (tc *testContext) iAddRoomWithQuantityToMyCart(roomName string, qty int) error {
	var product models.Product
	if err := tc.db.Where("nama_kamar = ?", roomName).First(&product).Error; err != nil {
		return err
	}

	reqBody, _ := json.Marshal(dto.CartItemRequest{
		ProductID: product.ID,
		Kuantitas: qty,
	})

	req := httptest.NewRequest(http.MethodPost, "/api/cart", bytes.NewBuffer(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer "+tc.token)

	rec := httptest.NewRecorder()
	tc.echoEngine.ServeHTTP(rec, req)
	tc.lastResponse = rec
	return nil
}

func (tc *testContext) theCartShouldContainWithQuantity(roomName string, expectedQty int) error {
	req := httptest.NewRequest(http.MethodGet, "/api/cart", nil)
	req.Header.Set("Authorization", "Bearer "+tc.token)

	rec := httptest.NewRecorder()
	tc.echoEngine.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		return fmt.Errorf("failed to get cart: status %d", rec.Code)
	}

	var res struct {
		Data models.Cart `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		return err
	}

	found := false
	for _, item := range res.Data.CartItems {
		if item.Product.NamaKamar == roomName {
			found = true
			if item.Kuantitas != expectedQty {
				return fmt.Errorf("expected quantity %d for room %s, but got %d", expectedQty, roomName, item.Kuantitas)
			}
		}
	}
	if !found {
		return fmt.Errorf("room %s not found in cart", roomName)
	}
	return nil
}

func (tc *testContext) theResponseErrorMessageShouldBe(expectedError string) error {
	return tc.theResponseMessageShouldBe(expectedError)
}

func (tc *testContext) iHaveARoomWithQuantityInMyCart(roomName string, qty int) error {
	err := tc.aRoomWithPriceAndStockExists(roomName, 1000000, 5)
	if err != nil && !strings.Contains(err.Error(), "UNIQUE constraint failed") {
		return err
	}
	err = tc.iAmLoggedInAs("user1@koshub.com")
	if err != nil {
		return err
	}
	return tc.iAddRoomWithQuantityToMyCart(roomName, qty)
}

func (tc *testContext) iCheckoutWithNamePhoneAndAddress(name, phone, address string) error {
	reqBody, _ := json.Marshal(dto.OrderRequest{
		NamaPenyewa:  name,
		NomorTelepon: phone,
		Alamat:       address,
	})

	req := httptest.NewRequest(http.MethodPost, "/api/orders", bytes.NewBuffer(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	req.Header.Set("Authorization", "Bearer "+tc.token)

	rec := httptest.NewRecorder()
	tc.echoEngine.ServeHTTP(rec, req)
	tc.lastResponse = rec
	return nil
}

func (tc *testContext) aReservationNumberShouldBeGenerated() error {
	if tc.lastResponse == nil {
		return errors.New("no response recorded")
	}
	var res struct {
		Data models.Order `json:"data"`
	}
	if err := json.Unmarshal(tc.lastResponse.Body.Bytes(), &res); err != nil {
		return err
	}
	if res.Data.ReservationNumber == "" {
		return errors.New("reservation number was not generated")
	}
	return nil
}

func (tc *testContext) theReservationStatusShouldBe(expectedStatus string) error {
	if tc.lastResponse == nil {
		return errors.New("no response recorded")
	}
	var res struct {
		Data models.Order `json:"data"`
	}
	if err := json.Unmarshal(tc.lastResponse.Body.Bytes(), &res); err != nil {
		return err
	}
	if res.Data.Status != expectedStatus {
		return fmt.Errorf("expected status '%s', but got '%s'", expectedStatus, res.Data.Status)
	}
	return nil
}

func (tc *testContext) myCartShouldBeEmpty() error {
	req := httptest.NewRequest(http.MethodGet, "/api/cart", nil)
	req.Header.Set("Authorization", "Bearer "+tc.token)

	rec := httptest.NewRecorder()
	tc.echoEngine.ServeHTTP(rec, req)

	var res struct {
		Data models.Cart `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &res); err != nil {
		return err
	}

	if len(res.Data.CartItems) != 0 {
		return fmt.Errorf("cart is not empty, contains %d items", len(res.Data.CartItems))
	}
	return nil
}

func InitializeScenario(ctx *godog.ScenarioContext) {
	tc := &testContext{}

	ctx.Before(func(ctx context.Context, sc *godog.Scenario) (context.Context, error) {
		tc.reset()
		return ctx, nil
	})

	ctx.Step(`^a user with email "([^"]*)" and password "([^"]*)" exists$`, tc.aUserWithEmailAndPasswordExists)
	ctx.Step(`^I send a POST request to "([^"]*)" with email "([^"]*)" and password "([^"]*)"$`, tc.iSendAPOSTRequestToWithEmailAndPassword)
	ctx.Step(`^the response status code should be (\d+)$`, tc.theResponseStatusCodeShouldBe)
	ctx.Step(`^the response message should be "([^"]*)"$`, tc.theResponseMessageShouldBe)
	ctx.Step(`^the response should contain a JWT token$`, tc.theResponseShouldContainAJWTToken)
	ctx.Step(`^a room "([^"]*)" with price (\d+) and stock (\d+) exists$`, func(name string, price int, stock int) error {
		return tc.aRoomWithPriceAndStockExists(name, float64(price), stock)
	})
	ctx.Step(`^I am logged in as "([^"]*)"$`, tc.iAmLoggedInAs)
	ctx.Step(`^I add room "([^"]*)" with quantity (\d+) to my cart$`, tc.iAddRoomWithQuantityToMyCart)
	ctx.Step(`^the cart should contain "([^"]*)" with quantity (\d+)$`, tc.theCartShouldContainWithQuantity)
	ctx.Step(`^the response error message should be "([^"]*)"$`, tc.theResponseErrorMessageShouldBe)
	ctx.Step(`^I have a room "([^"]*)" with quantity (\d+) in my cart$`, tc.iHaveARoomWithQuantityInMyCart)
	ctx.Step(`^I checkout with name "([^"]*)", phone "([^"]*)", and address "([^"]*)"$`, tc.iCheckoutWithNamePhoneAndAddress)
	ctx.Step(`^a reservation number should be generated$`, tc.aReservationNumberShouldBeGenerated)
	ctx.Step(`^the reservation status should be "([^"]*)"$`, tc.theReservationStatusShouldBe)
	ctx.Step(`^my cart should be empty$`, tc.myCartShouldBeEmpty)
}

func TestFeatures(t *testing.T) {
	suite := godog.TestSuite{
		ScenarioInitializer: InitializeScenario,
		Options: &godog.Options{
			Format:   "pretty",
			Paths:    []string{"koshub.feature"},
			TestingT: t,
		},
	}

	if suite.Run() != 0 {
		t.Fatal("non-zero status returned, BDD tests failed")
	}
}
