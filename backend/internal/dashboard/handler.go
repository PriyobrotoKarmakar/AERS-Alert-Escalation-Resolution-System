package dashboard

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	
)

type Handler struct {
	service *Service
}

func NewHandler(s *Service) *Handler {
	return &Handler{service: s}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/dashboard")
	{
		api.GET("/stats", h.HandleGetStats)
		api.GET("/trends", h.HandleGetTrends)
		api.GET("/top-offenders", h.HandleTopOffenders)
		api.GET("/recent-events", h.HandleRecentEvents)
	}
}

func (h *Handler) HandleGetStats(c *gin.Context) {
	stats, err := h.service.GetDashboardStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *Handler) HandleTopOffenders(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)

	offenders, err := h.service.GetTopOffenders(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch top offenders"})
		return
	}
	c.JSON(http.StatusOK, offenders)
}

func (h *Handler) HandleRecentEvents(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	events, err := h.service.GetRecentEvents(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent events"})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (h *Handler) HandleGetTrends(c *gin.Context) {
	daysStr := c.DefaultQuery("days", "7")
	days, _ := strconv.Atoi(daysStr)

	trends, err := h.service.GetTrends(c.Request.Context(), days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch trends data"})
		return
	}

	if trends == nil {
		trends = []TrendResult{}
	}

	c.JSON(http.StatusOK, trends)
}
