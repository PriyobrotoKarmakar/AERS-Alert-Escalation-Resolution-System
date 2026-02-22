package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Global variable to store JWT secret (set once at startup)
var jwtSecretKey string

func SetJWTSecret(secret string) {
	jwtSecretKey = secret
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := jwt.MapClaims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecretKey), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		emailClaim, ok := claims["email"]
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email claim missing"})
			c.Abort()
			return
		}

		email, ok := emailClaim.(string)
		if !ok || strings.TrimSpace(email) == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email claim"})
			c.Abort()
			return
		}

		c.Set("email", email)
		c.Next()
	}
}
