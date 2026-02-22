package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"aers-backend/internal/alerts"
	"aers-backend/pkg/db"

	"github.com/joho/godotenv"
)

func main() {

	godotenv.Load()

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI not found in environment")
	}

	_, database := db.ConnectMongo(mongoURI)
	repo := alerts.NewRepository(database)

	scanInterval := 5 * time.Minute
	expiryWindow := 24 * time.Hour

	log.Printf("🔄 AERS Background Worker started")
	log.Printf("⏰ Scan interval: %v | Expiry window: %v", scanInterval, expiryWindow)


	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	closedCount, err := repo.AutoCloseExpiredAlerts(ctx, expiryWindow)
	cancel()
	if err != nil {
		log.Printf("❌ Initial scan error: %v", err)
	} else {
		log.Printf("✅ Initial scan complete: %d alerts auto-closed", closedCount)
	}

	ticker := time.NewTicker(scanInterval)
	defer ticker.Stop()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	for {
		select {
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			closedCount, err := repo.AutoCloseExpiredAlerts(ctx, expiryWindow)
			cancel()

			if err != nil {
				log.Printf("❌ Error auto-closing alerts: %v", err)
			} else if closedCount > 0 {
				log.Printf("✅ Auto-closed %d alerts", closedCount)
			} else {
				log.Printf("✓ Scan complete: No alerts to auto-close")
			}
		case sig := <-sigChan:
			log.Printf("⚠️  Received signal %v, shutting down worker safely", sig)
			return
		}
	}
}
