package models

import "time"

const (
	StatusOpen       = "OPEN"
	StatusEscalated  = "ESCALATED"
	StatusAutoClosed = "AUTO-CLOSED"
	StatusResolved   = "RESOLVED"
)

type HistoryEntry struct {
	State string    `json:"state" bson:"state"`
	Time  time.Time `json:"time" bson:"time"`
	Note  string    `json:"note" bson:"note"`
}

type Alert struct {
	AlertID    string                 `json:"alertId" bson:"alertId"`
	DriverID   string                 `json:"driverId,omitempty" bson:"driverId,omitempty"`
	SourceType string                 `json:"sourceType" bson:"sourceType"`
	Severity   string                 `json:"severity" bson:"severity"`
	Timestamp  time.Time              `json:"timestamp" bson:"timestamp"`
	Status     string                 `json:"status" bson:"status"`
	Metadata   map[string]interface{} `json:"metadata" bson:"metadata"`
	History    []HistoryEntry         `json:"history,omitempty" bson:"history,omitempty"`
}
