package controllers

import (
	"net/http"
	"strconv"

	"koshub/dto"
	"koshub/helper"
	"koshub/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type CartController struct {
	cartService services.CartService
	validate    *validator.Validate
}

func NewCartController(cartService services.CartService) *CartController {
	return &CartController{
		cartService: cartService,
		validate:    validator.New(),
	}
}

// Get godoc
// @Summary Get User Cart
// @Description Retrieve the current logged-in user's cart and its items.
// @Tags cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} helper.Response{data=models.Cart} "User cart details"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Failure 500 {object} helper.Response "Internal server error"
// @Router /cart [get]
func (ctrl *CartController) Get(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	cart, err := ctrl.cartService.GetCart(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, "gagal mendapatkan keranjang", nil))
	}
	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengambil keranjang", cart))
}

// Add godoc
// @Summary Add Item to Cart
// @Description Add a room to the user's cart.
// @Tags cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CartItemRequest true "Cart item data"
// @Success 201 {object} helper.Response{data=models.CartItem} "Item added successfully"
// @Failure 400 {object} helper.Response "Invalid quantity or exceeds stock limit"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Router /cart [post]
func (ctrl *CartController) Add(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	var req dto.CartItemRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "kuantitas tidak valid (harus 1-10 kamar)", nil))
	}

	item, err := ctrl.cartService.AddToCart(userID, req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusCreated, helper.BuildResponse(true, "sukses menambahkan ke keranjang", item))
}

// Update godoc
// @Summary Update Cart Item Quantity
// @Description Update the quantity of a specific room in the user's cart.
// @Tags cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Cart Item ID"
// @Param request body dto.CartItemUpdateRequest true "Updated quantity data"
// @Success 200 {object} helper.Response{data=models.CartItem} "Cart item updated successfully"
// @Failure 400 {object} helper.Response "Invalid item ID, quantity parameters or stock constraints"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Router /cart/{id} [put]
func (ctrl *CartController) Update(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	idStr := c.Param("id")
	itemID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID item tidak valid", nil))
	}

	var req dto.CartItemUpdateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "kuantitas tidak valid (harus 1-10 kamar)", nil))
	}

	item, err := ctrl.cartService.UpdateCartItem(userID, uint(itemID), req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengubah kuantitas", item))
}

// Delete godoc
// @Summary Delete Cart Item
// @Description Remove an item from the user's cart by ID.
// @Tags cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Cart Item ID"
// @Success 200 {object} helper.Response "Item removed from cart"
// @Failure 400 {object} helper.Response "Invalid item ID or database error"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Router /cart/{id} [delete]
func (ctrl *CartController) Delete(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "tidak terotorisasi", nil))
	}
	idStr := c.Param("id")
	itemID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID item tidak valid", nil))
	}

	err = ctrl.cartService.DeleteCartItem(userID, uint(itemID))
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses menghapus item dari keranjang", nil))
}
