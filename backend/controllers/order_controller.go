package controllers

import (
	"net/http"
	"strconv"

	"koshub/dto"
	"koshub/helper"
	"koshub/models"
	"koshub/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type OrderController struct {
	orderService services.OrderService
	validate     *validator.Validate
}

func NewOrderController(orderService services.OrderService) *OrderController {
	return &OrderController{
		orderService: orderService,
		validate:     validator.New(),
	}
}

// Checkout godoc
// @Summary Reserve/Checkout Cart Items
// @Description Processes checkout and creates a new boarding room reservation.
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.OrderRequest true "Checkout tenant details"
// @Success 201 {object} helper.Response{data=models.Order} "Reservation created successfully"
// @Failure 400 {object} helper.Response "Empty cart or invalid tenant details"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Router /orders [post]
func (ctrl *OrderController) Checkout(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	var req dto.OrderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "nama penyewa, nomor telepon, dan alamat wajib diisi", nil))
	}

	order, err := ctrl.orderService.Checkout(userID, req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusCreated, helper.BuildResponse(true, "checkout berhasil", order))
}

// GetByID godoc
// @Summary Get Reservation Detail
// @Description Retrieve details of a specific reservation.
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Order ID"
// @Success 200 {object} helper.Response{data=models.Order} "Reservation details"
// @Failure 400 {object} helper.Response "Invalid reservation ID"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Failure 404 {object} helper.Response "Reservation not found or access denied"
// @Router /orders/{id} [get]
func (ctrl *OrderController) GetByID(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	role, _ := c.Get("role").(string)
	idStr := c.Param("id")
	orderID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID reservasi tidak valid", nil))
	}

	order, err := ctrl.orderService.GetOrderByID(userID, role, uint(orderID))
	if err != nil {
		return c.JSON(http.StatusNotFound, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengambil detail reservasi", order))
}

// GetOrders godoc
// @Summary List Reservations
// @Description Retrieve all reservations (admin) or personal reservations (user).
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} helper.Response{data=[]models.Order} "List of reservations"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Failure 500 {object} helper.Response "Internal server error"
// @Router /orders [get]
func (ctrl *OrderController) GetOrders(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	role, _ := c.Get("role").(string)

	var orders []models.Order
	var err error

	if role == "admin" {
		orders, err = ctrl.orderService.GetAllOrders()
	} else {
		orders, err = ctrl.orderService.GetMyOrders(userID)
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, "gagal mengambil data reservasi", nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengambil riwayat reservasi", orders))
}

// UpdateStatus godoc
// @Summary Update Reservation Status
// @Description Update the status of a reservation adhering to allowed state transition flows.
// @Tags orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Order ID"
// @Param request body dto.UpdateOrderStatusRequest true "New status value"
// @Success 200 {object} helper.Response{data=models.Order} "Reservation status updated"
// @Failure 400 {object} helper.Response "Invalid ID, invalid status value, or rejected state transition"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Router /orders/{id}/status [patch]
func (ctrl *OrderController) UpdateStatus(c echo.Context) error {
	idStr := c.Param("id")
	orderID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID reservasi tidak valid", nil))
	}

	var req dto.UpdateOrderStatusRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "status wajib diisi", nil))
	}

	order, err := ctrl.orderService.UpdateOrderStatus(uint(orderID), req.Status)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses memperbarui status reservasi", order))
}
