package rules

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	engine *Engine
}

func NewHandler(e *Engine) *Handler {
	return &Handler{engine: e}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/config")
	{
		api.GET("/rules", h.HandleGetAllRules)
		api.GET("/rules/:ruleName", h.HandleGetRule)
		api.PUT("/rules/:ruleName", h.HandleUpdateRule)
		api.POST("/rules/reload", h.HandleReloadRules)
	}
}

func (h *Handler) HandleGetAllRules(c *gin.Context) {
	c.JSON(http.StatusOK, h.engine.Config)
}

func (h *Handler) HandleGetRule(c *gin.Context) {
	ruleName := c.Param("ruleName")
	rule, exists := h.engine.Config[ruleName]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rule not found"})
		return
	}
	c.JSON(http.StatusOK, rule)
}

func (h *Handler) HandleUpdateRule(c *gin.Context) {
	ruleName := c.Param("ruleName")
	var newRule RuleConfig
	if err := c.ShouldBindJSON(&newRule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid rule format"})
		return
	}

	h.engine.Config[ruleName] = newRule

	err := h.engine.SaveRules("config/rules.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save rule to file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Rule updated successfully",
		"rule":    newRule,
	})
}

func (h *Handler) HandleReloadRules(c *gin.Context) {
	err := h.engine.LoadRules("config/rules.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reload rules"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Rules reloaded successfully",
		"rules":   h.engine.Config,
	})
}
