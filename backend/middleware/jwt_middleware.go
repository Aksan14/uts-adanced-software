package middleware

import (
	"net/http"
	"strings"

	"koshub/helper"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func JWTMiddleware(secret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "token otorisasi tidak ditemukan", nil))
			}

			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
				return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "format token tidak valid", nil))
			}

			tokenString := tokenParts[1]

			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "token kedaluwarsa atau tidak valid", nil))
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "klaim token tidak valid", nil))
			}

			userIDFloat, ok := claims["user_id"].(float64)
			if !ok {
				return c.JSON(http.StatusUnauthorized, helper.BuildResponse(false, "user ID dalam token tidak valid", nil))
			}

			role, _ := claims["role"].(string)

			c.Set("user_id", uint(userIDFloat))
			c.Set("role", role)

			return next(c)
		}
	}
}

func RequireAdmin() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role, ok := c.Get("role").(string)
			if !ok || role != "admin" {
				return c.JSON(http.StatusForbidden, helper.BuildResponse(false, "akses terbatas hanya untuk admin", nil))
			}
			return next(c)
		}
	}
}
