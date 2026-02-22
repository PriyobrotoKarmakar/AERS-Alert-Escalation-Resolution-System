import api from './axios'


export const getAlerts = () => api.get('/alerts')


export const getAlertDetails = (alertId) => api.get(`/alerts/${alertId}`)

export const resolveAlertManual = (alertId) => api.patch(`/alerts/${alertId}/resolve`)


export const createAlert = (alertData) => api.post('/alerts', alertData)