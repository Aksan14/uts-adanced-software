package controllers

import (
	"net/http"

	"koshub/config"
	"koshub/dto"
	"koshub/helper"
	"koshub/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type AuthController struct {
	authService services.AuthService
	cfg         config.Config
	validate    *validator.Validate
}

func NewAuthController(authService services.AuthService, cfg config.Config) *AuthController {
	return &AuthController{
		authService: authService,
		cfg:         cfg,
		validate:    validator.New(),
	}
}

// Login godoc
// @Summary User Login
// @Description Authenticates a user with email and password and returns a JWT token.
// @Tags authentication
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login Credentials"
// @Success 200 {object} helper.Response{data=dto.LoginResponse} "Successful login"
// @Failure 400 {object} helper.Response "Invalid input format"
// @Failure 401 {object} helper.Response "Invalid email or password"
// @Router /login [post]
func (ctrl *AuthController) Login(c echo.Context) error {
	var req dto.LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "email dan password wajib diisi dengan benar", nil))
	}

	res, err := ctrl.authService.Login(req, ctrl.cfg.JWTSecret)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "login berhasil", res))
}
