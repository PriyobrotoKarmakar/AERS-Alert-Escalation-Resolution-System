import axios from 'axios'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
 
    // Check if the error is 401 logic
    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login page or if it's a login attempt
      const isLoginRequest = error.config.url.includes('/auth/login')
      const isLoginPage = window.location.pathname === '/login'

      if (!isLoginRequest && !isLoginPage) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    
  
    const message = error.response?.data?.message || "A system error occurred. Please try again."
    return Promise.reject({ ...error, message })
  }
)

export default api