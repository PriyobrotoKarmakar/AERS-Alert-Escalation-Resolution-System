package rules

import (
	"aers-backend/internal/models"
	"encoding/json"
	"os"
	"strings"
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

	tempConfig := make(map[string]RuleConfig)
	if err := json.Unmarshal(file, &tempConfig); err != nil {
		return err
	}

	for key, value := range tempConfig {
		normalizedKey := strings.ToLower(strings.TrimSpace(key))
		e.Config[normalizedKey] = value
	}

	return nil
}

func (e *Engine) EvaluateEscalation(alert *models.Alert, recentCount int) {

	normalizedSourceType := strings.ToLower(strings.TrimSpace(alert.SourceType))
	rule, exists := e.Config[normalizedSourceType]
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

	normalizedSourceType := strings.ToLower(strings.TrimSpace(alert.SourceType))
	rule, exists := e.Config[normalizedSourceType]
	if !exists || rule.AutoCloseIf == "" {
		return false
	}

	
	if boolVal, ok := alert.Metadata[rule.AutoCloseIf].(bool); ok {
		return boolVal 
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
