package services

import (
	"errors"

	"koshub/dto"
	"koshub/helper"
	"koshub/repository"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(req dto.LoginRequest, jwtSecret string) (*dto.LoginResponse, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{userRepo}
}

func (s *authService) Login(req dto.LoginRequest, jwtSecret string) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, errors.New("email atau password salah")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("email atau password salah")
	}

	token, err := helper.GenerateToken(user.ID, user.Role, jwtSecret)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserInfo{
			ID:    user.ID,
			Nama:  user.Nama,
			Email: user.Email,
			Role:  user.Role,
		},
	}, nil
}
