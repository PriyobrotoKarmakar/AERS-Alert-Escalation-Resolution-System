package auth

import (
	"aers-backend/internal/models"
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo      *Repository
	jwtSecret string
}

func NewService(repo *Repository, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

func (s *Service) Signup(ctx context.Context, name, email, password string) (string, error) {
	// Check if user already exists
	existingUser, _ := s.repo.GetUserByEmail(ctx, email)
	if existingUser != nil {
		return "", errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("failed to hash password")
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
	}

	err = s.repo.CreateUser(ctx, user)
	if err != nil {
		// Handle duplicate key error from database
		if mongo.IsDuplicateKeyError(err) {
			return "", errors.New("user with this email already exists")
		}
		return "", err
	}

	return s.generateToken(email)
}

func (s *Service) generateToken(email string) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"iss":   "aers-backend",                 // Issuer
		"aud":   "aers-frontend",                // Audience
		"sub":   email,                          // Subject
		"iat":   now.Unix(),                     // Issued at
		"exp":   now.Add(time.Hour * 24).Unix(), // Expiry (24 hours)
	})
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *Service) Login(ctx context.Context, email, password string) (string, error) {
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return "", errors.New("user not found")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", errors.New("invalid password")
	}

	return s.generateToken(email)
}

func (s *Service) GetUser(ctx context.Context, email string) (*models.User, error) {
	return s.repo.GetUserByEmail(ctx, email)
}

func (s *Service) RefreshToken(email string) (string, error) {
	return s.generateToken(email)
}
