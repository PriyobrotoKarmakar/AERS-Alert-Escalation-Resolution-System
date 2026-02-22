package dashboard

import (
	"context"
	"encoding/json"
	"time"

	"aers-backend/pkg/cache"

	"go.mongodb.org/mongo-driver/bson"
)

type Service struct {
	repo  *Repository
	cache *cache.Cache
}

func NewService(repo *Repository, cache *cache.Cache) *Service {
	return &Service{
		repo:  repo,
		cache: cache,
	}
}

func (s *Service) GetDashboardStats(ctx context.Context) (map[string]int64, error) {
	cacheKey := "dashboard:stats"


	if s.cache != nil {
		if val, err := s.cache.Get(ctx, cacheKey); err == nil {
			var stats map[string]int64
			if err := json.Unmarshal([]byte(val), &stats); err == nil {
				return stats, nil
			}
		}
	}

	stats, err := s.repo.GetStats(ctx)
	if err != nil {
		return nil, err
	}

	
	if s.cache != nil {
		if data, err := json.Marshal(stats); err == nil {
			s.cache.Set(ctx, cacheKey, data, 5*time.Minute)
		}
	}

	return stats, nil
}

func (s *Service) GetTopOffenders(ctx context.Context, limit int) ([]bson.M, error) {
	if limit <= 0 {
		limit = 5
	}

	cacheKey := "dashboard:top_offenders"


	if s.cache != nil {
		if val, err := s.cache.Get(ctx, cacheKey); err == nil {
			var offenders []bson.M
			if err := json.Unmarshal([]byte(val), &offenders); err == nil {
				return offenders, nil
			}
		}
	}

	offenders, err := s.repo.GetTopOffenders(ctx, limit)
	if err != nil {
		return nil, err
	}


	if s.cache != nil {
		if data, err := json.Marshal(offenders); err == nil {
			s.cache.Set(ctx, cacheKey, data, 10*time.Minute)
		}
	}

	return offenders, nil
}

func (s *Service) GetRecentEvents(ctx context.Context, limit int) ([]bson.M, error) {
	if limit <= 0 {
		limit = 10
	}

	cacheKey := "dashboard:recent_events"

	
	if s.cache != nil {
		if val, err := s.cache.Get(ctx, cacheKey); err == nil {
			var events []bson.M
			if err := json.Unmarshal([]byte(val), &events); err == nil {
				return events, nil
			}
		}
	}

	events, err := s.repo.GetRecentEvents(ctx, limit)
	if err != nil {
		return nil, err
	}


	if s.cache != nil {
		if data, err := json.Marshal(events); err == nil {
			s.cache.Set(ctx, cacheKey, data, 1*time.Minute)
		}
	}

	return events, nil
}

func (s *Service) GetTrends(ctx context.Context, days int) ([]TrendResult, error) {
	if days <= 0 {
		days = 7
	}

	cacheKey := "dashboard:trends"


	if s.cache != nil {
		if val, err := s.cache.Get(ctx, cacheKey); err == nil {
			var trends []TrendResult
			if err := json.Unmarshal([]byte(val), &trends); err == nil {
				return trends, nil
			}
		}
	}

	trends, err := s.repo.GetTrends(ctx, days)
	if err != nil {
		return nil, err
	}

	
	if s.cache != nil {
		if data, err := json.Marshal(trends); err == nil {
			s.cache.Set(ctx, cacheKey, data, 30*time.Minute)
		}
	}

	return trends, nil
}
