package controllers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"koshub/dto"
	"koshub/helper"
	"koshub/services"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type ProductController struct {
	productService services.ProductService
	validate       *validator.Validate
}

func NewProductController(productService services.ProductService) *ProductController {
	return &ProductController{
		productService: productService,
		validate:       validator.New(),
	}
}

// GetAll godoc
// @Summary List Boarding Rooms
// @Description Get a list of all boarding rooms available.
// @Tags products
// @Accept json
// @Produce json
// @Success 200 {object} helper.Response{data=[]models.Product} "List of rooms"
// @Failure 500 {object} helper.Response "Internal server error"
// @Router /products [get]
func (ctrl *ProductController) GetAll(c echo.Context) error {
	products, err := ctrl.productService.GetAllProducts()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, "gagal mengambil data kamar", nil))
	}
	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengambil semua kamar", products))
}

// GetByID godoc
// @Summary Get Boarding Room Detail
// @Description Retrieve details of a specific boarding room by ID.
// @Tags products
// @Accept json
// @Produce json
// @Param id path int true "Product ID"
// @Success 200 {object} helper.Response{data=models.Product} "Room details"
// @Failure 400 {object} helper.Response "Invalid ID parameter"
// @Failure 404 {object} helper.Response "Room not found"
// @Router /products/{id} [get]
func (ctrl *ProductController) GetByID(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID kamar tidak valid", nil))
	}

	product, err := ctrl.productService.GetProductByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, helper.BuildResponse(false, "kamar tidak ditemukan", nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengambil detail kamar", product))
}

// Create godoc
// @Summary Create Boarding Room
// @Description Add a new boarding room (Admin only).
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.ProductRequest true "Room data"
// @Success 201 {object} helper.Response{data=models.Product} "Room created"
// @Failure 400 {object} helper.Response "Invalid request body or validation failure"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Failure 403 {object} helper.Response "Forbidden (Admin only)"
// @Router /products [post]
func (ctrl *ProductController) Create(c echo.Context) error {
	var req dto.ProductRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	product, err := ctrl.productService.CreateProduct(req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusCreated, helper.BuildResponse(true, "sukses menambahkan kamar baru", product))
}

// Update godoc
// @Summary Update Boarding Room
// @Description Update existing boarding room details (Admin only).
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Product ID"
// @Param request body dto.ProductRequest true "Updated room data"
// @Success 200 {object} helper.Response{data=models.Product} "Room updated"
// @Failure 400 {object} helper.Response "Invalid ID or update parameters"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Failure 403 {object} helper.Response "Forbidden (Admin only)"
// @Router /products/{id} [put]
func (ctrl *ProductController) Update(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID kamar tidak valid", nil))
	}

	var req dto.ProductRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "input tidak valid", nil))
	}

	if err := ctrl.validate.Struct(&req); err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	product, err := ctrl.productService.UpdateProduct(uint(id), req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses memperbarui data kamar", product))
}

// Delete godoc
// @Summary Delete Boarding Room
// @Description Delete a boarding room by ID (Admin only).
// @Tags products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Product ID"
// @Success 200 {object} helper.Response "Room deleted"
// @Failure 400 {object} helper.Response "Invalid ID or database error"
// @Failure 401 {object} helper.Response "Unauthorized"
// @Failure 403 {object} helper.Response "Forbidden (Admin only)"
// @Router /products/{id} [delete]
func (ctrl *ProductController) Delete(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "ID kamar tidak valid", nil))
	}

	err = ctrl.productService.DeleteProduct(uint(id))
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, err.Error(), nil))
	}

	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses menghapus kamar", nil))
}

// @Router /upload [post]
func (ctrl *ProductController) Upload(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, helper.BuildResponse(false, "file tidak ditemukan", nil))
	}
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, err.Error(), nil))
	}
	defer src.Close()

	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		err = os.Mkdir("uploads", 0755)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, "gagal membuat direktori uploads", nil))
		}
	}

	filename := strconv.FormatInt(time.Now().UnixNano(), 10) + "_" + filepath.Base(file.Filename)
	dstPath := filepath.Join("uploads", filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, err.Error(), nil))
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return c.JSON(http.StatusInternalServerError, helper.BuildResponse(false, err.Error(), nil))
	}

	relativePath := "uploads/" + filename
	return c.JSON(http.StatusOK, helper.BuildResponse(true, "sukses mengunggah file", map[string]string{
		"path": relativePath,
	}))
}
