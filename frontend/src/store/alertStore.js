import { create } from 'zustand'
import api from '@/api/axios'

const useAlertStore = create((set) => ({
  alerts: [],
  isLoading: false,
  error: null,

  fetchAlerts: async () => {
    set({ isLoading: true })
    try {
      const response = await api.get('/alerts')
      set({ alerts: response.data, isLoading: false })
    } catch (err) {
      set({ error: "Failed to sync with central API", isLoading: false })
    }
  },

  resolveAlert: async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`)
      set((state) => ({
        alerts: state.alerts.map((a) => 
          a.alertId === alertId ? { ...a, status: 'RESOLVED' } : a
        )
      }))
    } catch (err) {
      console.error("Manual resolution failed")
    }
  }
}))

export default useAlertStore