package alerts

import (
	"net/http"
	"aers-backend/internal/models"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *AlertService
}

func NewHandler(s *AlertService) *Handler {
	return &Handler{service: s}
}

func (h *Handler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/alerts")
	{
		api.POST("", h.HandleIngest)
		api.GET("", h.HandleGetAll)
		api.GET("/:alertId", h.HandleGetByID)
		api.PATCH("/:alertId/resolve", h.HandleResolve)
	}
}

func (h *Handler) HandleIngest(c *gin.Context) {
	var input models.Alert
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert format"})
		return
	}

	id, err := h.service.IngestAlert(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to ingest alert"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"alertId": id, "status": "success"})
}

func (h *Handler) HandleGetAll(c *gin.Context) {
	alerts, err := h.service.repo.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch alerts"})
		return
	}
	c.JSON(http.StatusOK, alerts)
}


func (h *Handler) HandleGetByID(c *gin.Context) {
	id := c.Param("alertId")
	alert, err := h.service.GetAlert(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}
	c.JSON(http.StatusOK, alert)
}

func (h *Handler) HandleResolve(c *gin.Context) {
	id := c.Param("alertId")
	
	err := h.service.ResolveAlert(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve alert"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id": id,
		"status": models.StatusResolved,
		"message": "Alert resolved successfully",
	})
}