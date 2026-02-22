package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{service: s}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	auth := r.Group("/api/auth")
	{
		auth.POST("/signup", h.HandleSignup)
		auth.POST("/login", h.HandleLogin)
		protected := auth.Group("/")
		protected.Use(AuthMiddleware())
		{
			protected.GET("/me", h.HandleGetMe)
			protected.POST("/refresh", h.HandleRefresh)
		}
	}
}

func (h *Handler) HandleSignup(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data: " + err.Error()})
		return
	}

	token, err := h.service.Signup(c.Request.Context(), input.Name, input.Email, input.Password)
	if err != nil {
		errMsg := err.Error()
		if errMsg == "user already exists" || errMsg == "user with this email already exists" {
			c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"token": token, "message": "User created successfully"})
}

func (h *Handler) HandleLogin(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	token, err := h.service.Login(c.Request.Context(), input.Email, input.Password)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "User does not exist"})
			return
		} else if err.Error() == "invalid password" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
			return
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func (h *Handler) HandleGetMe(c *gin.Context) {

	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	emailStr, ok := email.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	user, err := h.service.GetUser(c.Request.Context(), emailStr)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// NEW: Refresh JWT Token
func (h *Handler) HandleRefresh(c *gin.Context) {
	email, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	emailStr, ok := email.(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	newToken, err := h.service.RefreshToken(emailStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": newToken,
	})
}
