package main

import (
	"context"
	"log"
	"os"
	"time"

	"aers-backend/internal/alerts"
	"aers-backend/internal/auth"
	"aers-backend/internal/dashboard"
	"aers-backend/internal/rules"
	"aers-backend/pkg/cache"
	"aers-backend/pkg/db"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	_ = godotenv.Load()
	startTime := time.Now()

	//rules
	ruleEngine := rules.NewEngine()
	if err := ruleEngine.LoadRules("config/rules.json"); err != nil {
		log.Fatalf("Failed to load rules: %v", err)
	}
	

	var redisCache *cache.Cache
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr != "" {
		redisPassword := os.Getenv("REDIS_PASSWORD")
		useTLS := os.Getenv("REDIS_USE_TLS") == "true"

		var err error
		redisCache, err = cache.NewCache(redisAddr, redisPassword, useTLS)
		if err != nil {
			log.Printf(" Redis cache unavailable: %v (continuing without cache)", err)
		} else {
			log.Println("Redis cache connected")
			defer redisCache.Close()
		}
	} else {
		log.Println("Redis not configured, running without cache")
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI not found in environment")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET not found in environment. Please set a secure secret key.")
	}
	if len(jwtSecret) < 32 {
		log.Fatal("JWT_SECRET must be at least 32 characters long for security")
	}
	log.Println("JWT_SECRET validated")

	client, database := db.ConnectMongo(mongoURI)
	log.Println("MongoDB connected successfully")

	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"https://aers-alert-escalation-resolution-sy.vercel.app", 
			"http://localhost:5173",                                  
			"http://localhost:3000",                                  
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))


	auth.SetJWTSecret(jwtSecret)
	authGroup := r.Group("/")
	authGroup.Use(auth.AuthMiddleware())

	//Auth
	authRepo := auth.NewRepository(database)
	authService := auth.NewService(authRepo, jwtSecret)
	authHandler := auth.NewHandler(authService)
	authHandler.RegisterRoutes(r)

	// Alerts
	alertRepo := alerts.NewRepository(database)
	alertService := alerts.NewAlertService(alertRepo, ruleEngine, redisCache)
	alertHandler := alerts.NewHandler(alertService)
	alertHandler.RegisterRoutes(r)

	// Dashboard
	dashboardRepo := dashboard.NewRepository(database)
	dashboardService := dashboard.NewService(dashboardRepo, redisCache)
	dashboardHandler := dashboard.NewHandler(dashboardService)
	dashboardHandler.RegisterRoutes(r)

	//Rules
	rulesHandler := rules.NewHandler(ruleEngine)
	rulesHandler.RegisterRoutes(r, auth.AuthMiddleware())

	r.GET("/api/health", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		dbStatus := "Connected"
		if err := client.Ping(ctx, nil); err != nil {
			dbStatus = "Disconnected"
		}

		cacheStatus := "Not Configured"
		if redisCache != nil {
			if _, err := redisCache.Get(ctx, "ping"); err != nil && err.Error() != "redis: nil" {
				cacheStatus = "Disconnected"
			} else {
				cacheStatus = "Connected"
			}
		}

		c.JSON(200, gin.H{
			"status":   "AERS System Operational",
			"database": dbStatus,
			"redis":    cacheStatus,
			"uptime":   time.Since(startTime).String(),
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("AERS API Gateway starting on port %s", port)


	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
