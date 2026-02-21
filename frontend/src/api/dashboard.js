import api from './axios'


export const getDashboardStats = () => api.get('/dashboard/stats')


export const getAlertTrends = (days = 7) => api.get(`/dashboard/trends?days=${days}`)


export const getTopOffenders = (limit = 5) => api.get(`/dashboard/top-offenders?limit=${limit}`)

export const getRecentEvents = (limit = 10) => api.get(`/dashboard/recent-events?limit=${limit}`)
