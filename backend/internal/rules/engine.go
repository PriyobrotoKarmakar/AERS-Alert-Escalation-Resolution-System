package rules

import (
	"aers-backend/internal/models"
	"encoding/json"
	"os"
)

type RuleConfig struct {
	EscalateIfCount int    `json:"escalate_if_count,omitempty"`
	WindowMins      int    `json:"window_mins,omitempty"`
	TargetSeverity  string `json:"target_severity,omitempty"`
	AutoCloseIf     string `json:"auto_close_if,omitempty"`
}

type Engine struct {
	Config map[string]RuleConfig
}

func NewEngine() *Engine {
	return &Engine{
		Config: make(map[string]RuleConfig),
	}
}

func (e *Engine) LoadRules(filePath string) error {
	file, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}
	return json.Unmarshal(file, &e.Config)
}

func (e *Engine) EvaluateEscalation(alert *models.Alert, recentCount int) {
	rule, exists := e.Config[alert.SourceType]
	if !exists || rule.EscalateIfCount == 0 {
		return
	}

	if recentCount >= rule.EscalateIfCount {
		alert.Status = models.StatusEscalated
		alert.Severity = rule.TargetSeverity
	}
}

func (e *Engine) SaveRules(filePath string) error {
	data, err := json.MarshalIndent(e.Config, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filePath, data, 0644)
}

func (e *Engine) EvaluateAutoClose(alert *models.Alert) bool {
	rule, exists := e.Config[alert.SourceType]
	if !exists || rule.AutoCloseIf == "" {
		return false
	}

	
	if docStatus, ok := alert.Metadata["documentStatus"].(string); ok {
		if docStatus == rule.AutoCloseIf {
			return true
		}
	}

	if docStatus, ok := alert.Metadata["document_status"].(string); ok {
		if docStatus == rule.AutoCloseIf {
			return true
		}
	}

	if status, ok := alert.Metadata["status"].(string); ok {
		if status == rule.AutoCloseIf {
			return true
		}
	}

	return false
}
