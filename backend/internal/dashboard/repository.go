package dashboard

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		collection: db.Collection("alerts"),
	}
}

func (r *Repository) GetStats(ctx context.Context) (map[string]int64, error) {
	stats := make(map[string]int64)

	active, _ := r.collection.CountDocuments(ctx, bson.M{"status": bson.M{"$in": []string{"OPEN", "ESCALATED"}}})
	stats["totalActive"] = active

	escalated, _ := r.collection.CountDocuments(ctx, bson.M{"status": "ESCALATED"})
	stats["escalated"] = escalated

	autoClosed, _ := r.collection.CountDocuments(ctx, bson.M{"status": "AUTO-CLOSED"})
	stats["autoClosed24h"] = autoClosed

	return stats, nil
}

func (r *Repository) GetTopOffenders(ctx context.Context, limit int) ([]bson.M, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"status": bson.M{"$in": []string{"OPEN", "ESCALATED", "WARNING", "RESOLVED"}}}}},
		{{Key: "$group", Value: bson.M{
			"_id":         "$metadata.driverId",
			"alertCount":  bson.M{"$sum": 1},
			"driverName":  bson.M{"$first": "$metadata.driverName"},
			"driverPhone": bson.M{"$first": "$metadata.driverPhone"},
			"severity":    bson.M{"$max": "$severity"},
		}}},
		{{Key: "$sort", Value: bson.M{"alertCount": -1}}},
		{{Key: "$limit", Value: limit}},
		{{Key: "$project", Value: bson.M{
			"_id":         0,
			"driverId":    "$_id",
			"driverName":  1,
			"driverPhone": 1,
			"alertCount":  1,
			"severity":    1,
		}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}

type TrendResult struct {
	Name       string `json:"name" bson:"name"`
	Total      int    `json:"total" bson:"total"`
	Escalated  int    `json:"escalated" bson:"escalated"`
	AutoClosed int    `json:"autoClosed" bson:"autoClosed"`
}

func (r *Repository) GetTrends(ctx context.Context, days int) ([]TrendResult, error) {
	cutoff := time.Now().AddDate(0, 0, -days)

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"timestamp": bson.M{"$gte": cutoff}}}},
		{{Key: "$group", Value: bson.M{
			"_id":        bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$timestamp"}},
			"total":      bson.M{"$sum": 1},
			"escalated":  bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$status", "ESCALATED"}}, 1, 0}}},
			"autoClosed": bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$status", "AUTO-CLOSED"}}, 1, 0}}},
		}}},
		{{Key: "$project", Value: bson.M{
			"_id":        0,
			"name":       "$_id",
			"total":      1,
			"escalated":  1,
			"autoClosed": 1,
		}}},
		{{Key: "$sort", Value: bson.M{"name": 1}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	var results []TrendResult
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func (r *Repository) GetRecentEvents(ctx context.Context, limit int) ([]bson.M, error) {
	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(int64(limit))
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}

	var events []bson.M
	err = cursor.All(ctx, &events)
	return events, err
}
