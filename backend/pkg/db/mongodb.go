package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongo(uri string) (*mongo.Client, *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Connection error:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Database unreachable:", err)
	}

	log.Println("AERS connected to MongoDB Atlas!")
	return client, client.Database("aers_db")
}