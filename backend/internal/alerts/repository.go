package alerts

import (
	"aers-backend/internal/models"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		collection: db.Collection("alerts"),
	}
}

type AlertRepository struct {
	collection *mongo.Collection
}

func NewAlertRepository(db *mongo.Database) *AlertRepository {
	return &AlertRepository{
		collection: db.Collection("alerts"),
	}
}

func (r *AlertRepository) Create(ctx context.Context, alert *models.Alert) error {
	_, err := r.collection.InsertOne(ctx, alert)
	return err
}

func (r *AlertRepository) GetAll(ctx context.Context) ([]models.Alert, error) {
	var alerts []models.Alert

	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	err = cursor.All(ctx, &alerts)
	return alerts, err
}

func (r *AlertRepository) GetByID(ctx context.Context, alertID string) (*models.Alert, error) {
	var alert models.Alert
	err := r.collection.FindOne(ctx, bson.M{"alertId": alertID}).Decode(&alert)
	return &alert, err
}

func (r *AlertRepository) UpdateStatus(ctx context.Context, alertID string, status string) error {

	historyEntry := models.HistoryEntry{
		State: status,
		Time:  time.Now(),
		Note:  getStatusNote(status),
	}

	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"alertId": alertID},
		bson.M{
			"$set":  bson.M{"status": status},
			"$push": bson.M{"history": historyEntry},
		},
	)
	return err
}

func getStatusNote(status string) string {
	switch status {
	case models.StatusResolved:
		return "Manually resolved by operator"
	case models.StatusEscalated:
		return "Auto-escalated by Rule Engine"
	case models.StatusAutoClosed:
		return "Auto-closed due to expiry"
	default:
		return "Status updated"
	}
}

func (r *Repository) AutoCloseExpiredAlerts(ctx context.Context, expiryWindow time.Duration) (int64, error) {
	cutoffTime := time.Now().Add(-expiryWindow)

	filter := bson.M{
		"status":    bson.M{"$nin": []string{models.StatusResolved, models.StatusAutoClosed}},
		"timestamp": bson.M{"$lte": cutoffTime},
	}

	update := bson.M{
		"$set": bson.M{
			"status": models.StatusAutoClosed,
		},
	}

	result, err := r.collection.UpdateMany(ctx, filter, update)
	if err != nil {
		return 0, err
	}

	return result.ModifiedCount, nil
}
