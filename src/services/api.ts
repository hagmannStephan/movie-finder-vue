import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Type definitions based on API schemas
export interface MovieProfile {
  id: number | null
  title: string | null
  overview: string | null
  genres: Genre[] | null
  release_date: string | null
  vote_average: number | null
  vote_count: number | null
  runtime: number | null
  tagline: string | null
  keywords: string[] | null
  poster_path: string | null
  backdrop_path: string | null
  images_path: string[] | null
  watch_providers: object | null
}

export interface Genre {
  id: number
  name: string
}

export interface GroupMatch {
  group_id: number
  count_likes: number
  last_update: string
  movie: MovieProfile
}

export interface GroupMatchQuery {
  group_members: number
  matches: GroupMatch[]
}

const API_BASE_URL = 'https://api.moviefinder.stephanhagmann.ch'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Debug logging for API requests
    if (config.url?.includes('/members')) {
      console.log('=== API REQUEST DEBUG ===')
      console.log('URL:', config.url)
      console.log('Method:', config.method)
      console.log('Headers:', config.headers)
      console.log('Data:', config.data)
      console.log('Auth Token exists:', !!token)
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Only redirect to login if it's a genuine authentication failure
    // (not just a 401 from a specific API operation)
    if (error.response?.status === 401) {
      // Check if the 401 is from login or profile endpoints - these indicate auth failure
      if (error.config?.url?.includes('/auth/token') || 
          error.config?.url?.includes('/users/me')) {
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
      // For other 401s (like leaving a group you're not authorized to leave),
      // don't redirect, just let the error bubble up to be handled by the calling code
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) => {
    // Login requires form-urlencoded data
    const formData = new URLSearchParams()
    formData.append('email', email)
    formData.append('password', password)
    
    return api.post('/auth/token/', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
  
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/users/', userData),
  
  logout: () => api.post('/auth/logout'), // This endpoint might not exist, but keeping for now
  
  getProfile: () => api.get('/users/me'),
}

// Groups API
export const groupsAPI = {
  getGroups: async () => {
    // First get current user to get user_id
    const userResponse = await api.get('/users/me')
    const userId = userResponse.data.user_id
    // Then get groups for this user
    return api.get(`/users/${userId}/groups`)
  },
  
  createGroup: (data: { name: string }) => api.post('/groups/', data),
  
  getGroup: (id: number) => api.get(`/groups/${id}`),
  
  // Get group details with members
  getGroupWithMembers: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}`)
    return response
  },
  
  updateGroup: async (id: number, data: { name: string, admin_id?: number }) => {
    // If admin_id is not provided, get the current group details first
    if (!data.admin_id) {
      const groupResponse = await api.get(`/groups/${id}`)
      data.admin_id = groupResponse.data.admin_id
    }
    
    return api.patch(`/groups/${id}`, {
      name: data.name,
      admin_id: data.admin_id
    })
  },
  
  deleteGroup: (id: number) => api.delete(`/groups/${id}`),
  
  leaveGroup: async (groupId: string | number) => {
    // Get current user_id to use as member_id
    const userResponse = await api.get('/users/me')
    const userId = userResponse.data.user_id
    console.log('Leaving group:', groupId, 'for user:', userId)
    return api.delete(`/groups/${groupId}/members/${userId}`)
  },
  
  // Note: API doesn't support getting group members (GET /groups/{id}/members returns 405)
  // getGroupMembers: (groupId: string) => api.get(`/groups/${groupId}/members`),
  
  addMemberToGroup: (groupId: number, friendCode: string) => {
    console.log('=== API addMemberToGroup ===')
    console.log('Group ID:', groupId)
    console.log('Friend Code:', friendCode)
    console.log('Request payload:', { friend_code: friendCode })
    
    return api.post(`/groups/${groupId}/members`, { friend_code: friendCode })
  },
  
  removeMemberFromGroup: (groupId: number, memberId: number) => 
    api.delete(`/groups/${groupId}/members/${memberId}`)
}

// Movies API
export const moviesAPI = {
  // Search and basic movie operations
  searchMovies: (query: string) => api.get(`/movies/search?keywords=${encodeURIComponent(query)}`),
  getMovieDetails: (movieId: number) => api.get(`/movies/${movieId}`),
  getRandomMovie: () => api.get('/movies/random'),
  getGenres: () => api.get('/movies/genres'),
  getWatchProviders: () => api.get('/movies/watch-providers'),
  getPopularWatchProviders: () => api.get('/movies/watch-providers/popular'),
  
  // Movie interactions (swipe-based)
  likeMovie: (movieId: number) => api.post(`/movies/${movieId}/right-swipe`),
  dislikeMovie: (movieId: number) => api.post(`/movies/${movieId}/left-swipe`),
  
  // User favorites
  addToFavorites: (movieId: number) => api.post(`/movies/${movieId}/right-swipe`), // Same as likeMovie
  removeFromFavorites: async (movieId: number) => {
    const userResponse = await api.get('/users/me')
    const userId = userResponse.data.user_id
    return api.delete(`/users/${userId}/favourites/${movieId}`)
  },
  getFavorites: async () => {
    const userResponse = await api.get('/users/me')
    const userId = userResponse.data.user_id
    return api.get(`/users/${userId}/favourites`)
  },
  
  // Group matches
  getGroupMatches: (groupId: number) => api.get(`/groups/${groupId}/matches`)
}

export default api 