<template>
  <div class="swipe-view">
    <div class="top-bar">
      <div class="user-greeting">
        <h2>Hi, {{ userProfile?.name || '{username}' }}!</h2>
      </div>
      <div class="search-section">
        <div class="search-bar" @click="openSearch">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="movie-card-container" v-if="!loading">
      <div v-if="currentMovie" class="movie-card" :class="{ 'swiping': isAnimating }">
        <div class="movie-poster">
          <img 
            v-if="currentMovie.poster_path" 
            :src="getImageUrl(currentMovie.poster_path)" 
            :alt="currentMovie.title || 'Movie Poster'"
            class="poster-image"
            @error="onImageError"
          />
          <div v-else class="poster-placeholder">
            <span>{{ currentMovie.title || 'Movie Cover' }}</span>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">{{ currentMovie.title || 'Unknown Title' }}</h3>
          <div class="movie-details">
            <span v-if="currentMovie.release_date" class="release-year">
              {{ new Date(currentMovie.release_date).getFullYear() }}
            </span>
            <span v-if="currentMovie.vote_average" class="rating">
              ⭐ {{ currentMovie.vote_average.toFixed(1) }}
            </span>
          </div>
          <p v-if="currentMovie.overview" class="movie-overview">
            {{ truncateText(currentMovie.overview, 100) }}
          </p>
        </div>
      </div>
      
      <div v-else-if="!hasMoreMovies" class="no-more-movies">
        <h3>No more movies!</h3>
        <p>You've seen all available movies. Check back later!</p>
        <button @click="resetMovies" class="reset-btn">Start Over</button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading movies...</p>
    </div>

    <div class="swipe-actions" v-if="currentMovie && !loading">
      <button class="swipe-btn dislike-btn" @click="dislikeMovie" :disabled="isAnimating">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button class="swipe-btn like-btn" @click="likeMovie" :disabled="isAnimating">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04096 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="loadNextMovie" class="retry-btn">Try Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { moviesAPI, authAPI, type MovieProfile } from '../services/api'

const router = useRouter()

// State
const currentMovie = ref<MovieProfile | null>(null)
const userProfile = ref<any>(null)
const loading = ref(false)
const error = ref('')
const isAnimating = ref(false)
const hasMoreMovies = ref(true)
const movieQueue = ref<MovieProfile[]>([])

// Load user profile
onMounted(async () => {
  await loadUserProfile()
  await loadNextMovie()
})

const loadUserProfile = async () => {
  try {
    const response = await authAPI.getProfile()
    userProfile.value = response.data
  } catch (err) {
    console.error('Error loading user profile:', err)
  }
}

const loadNextMovie = async () => {
  if (movieQueue.value.length === 0) {
    await loadMovieBatch()
  }
  
  if (movieQueue.value.length > 0) {
    currentMovie.value = movieQueue.value.shift() || null
  } else {
    hasMoreMovies.value = false
  }
}

const loadMovieBatch = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Load multiple random movies to create a queue
    const promises = Array(5).fill(null).map(() => moviesAPI.getRandomMovie())
    const responses = await Promise.allSettled(promises)
    
    const newMovies = responses
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value.data)
      .filter(movie => movie && movie.id) // Filter out invalid movies
    
    if (newMovies.length > 0) {
      movieQueue.value.push(...newMovies)
      hasMoreMovies.value = true
    } else {
      hasMoreMovies.value = false
    }
  } catch (err: any) {
    console.error('Error loading movies:', err)
    error.value = 'Failed to load movies. Please try again.'
    hasMoreMovies.value = false
  } finally {
    loading.value = false
  }
}

const likeMovie = async () => {
  if (!currentMovie.value?.id || isAnimating.value) return
  
  try {
    isAnimating.value = true
    await moviesAPI.likeMovie(currentMovie.value.id)
    
    // Add swipe animation
    setTimeout(async () => {
      await loadNextMovie()
      isAnimating.value = false
    }, 300)
  } catch (err: any) {
    console.error('Error liking movie:', err)
    error.value = 'Failed to like movie'
    isAnimating.value = false
  }
}

const dislikeMovie = async () => {
  if (!currentMovie.value?.id || isAnimating.value) return
  
  try {
    isAnimating.value = true
    await moviesAPI.dislikeMovie(currentMovie.value.id)
    
    // Add swipe animation
    setTimeout(async () => {
      await loadNextMovie()
      isAnimating.value = false
    }, 300)
  } catch (err: any) {
    console.error('Error disliking movie:', err)
    error.value = 'Failed to dislike movie'
    isAnimating.value = false
  }
}

const resetMovies = async () => {
  movieQueue.value = []
  currentMovie.value = null
  hasMoreMovies.value = true
  await loadNextMovie()
}

const openSearch = () => {
  // TODO: Implement search functionality
  console.log('Search clicked - implement search modal')
}

const getImageUrl = (posterPath: string) => {
  // TMDb image base URL
  return `https://image.tmdb.org/t/p/w500${posterPath}`
}

const onImageError = (event: Event) => {
  // Hide broken image and show placeholder
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
</script>

<style scoped>
.swipe-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  box-sizing: border-box;
  height: 100%;
}

.top-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  margin-right: 20px;
  gap: 7rem;
  margin-bottom: 0.5rem;
}

.user-greeting {
  margin-bottom: 0;
  text-align: left;
  flex-shrink: 0;
}

.user-greeting h2 {
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 600;
  margin: 0;
}

.search-section {
  margin-bottom: 0;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.search-bar {
  width: clamp(50px, 12vw, 60px);
  height: clamp(50px, 12vw, 60px);
  border-radius: 50%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-bar:hover {
  background: #3a3a3a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.search-icon {
  color: white;
}

.movie-card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  min-height: 0;
  padding: 0 4px;
  margin-left: auto;
  margin-right: auto;
}

.movie-card {
  width: 100%;
  max-width: min(320px, 90vw);
  background: #2a2a2a;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  max-height: 100%;
}

.movie-card:hover {
  transform: translateY(-4px);
}

.movie-card.swiping {
  transform: scale(0.95);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.movie-poster {
  width: 100%;
  height: clamp(250px, 50vh, 400px);
  position: relative;
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px 20px 0 0;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff8a80, #ff5722);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: clamp(16px, 4vw, 18px);
  font-weight: 600;
}

.movie-info {
  padding: clamp(15px, 4vw, 20px);
  text-align: center;
}

.movie-title {
  color: white;
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
}

.movie-details {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.release-year, .rating {
  color: #888;
  font-size: clamp(12px, 3vw, 14px);
  font-weight: 500;
}

.rating {
  color: #ffd700;
}

.movie-overview {
  color: #ccc;
  font-size: clamp(12px, 3vw, 14px);
  line-height: 1.4;
  margin: 0;
  text-align: center;
}

.swipe-actions {
  display: flex;
  justify-content: center;
  gap: 6.5rem;
  padding: 20px 20px;
  flex-shrink: 0;
}

.swipe-btn {
  width: clamp(60px, 15vw, 70px);
  height: clamp(60px, 15vw, 70px);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.dislike-btn {
  background: linear-gradient(135deg, #9e9e9e, #757575);
  color: white;
}

.dislike-btn:hover {
  background: linear-gradient(135deg, #757575, #616161);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(158, 158, 158, 0.4);
}

.like-btn {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
}

.like-btn:hover {
  background: linear-gradient(135deg, #c2185b, #ad1457);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
}

.swipe-btn:active {
  transform: translateY(-1px);
}

.swipe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #444;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-more-movies {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 20px;
}

.no-more-movies h3 {
  font-size: clamp(20px, 5vw, 24px);
  margin-bottom: 10px;
}

.no-more-movies p {
  color: #888;
  margin-bottom: 20px;
  font-size: clamp(14px, 3vw, 16px);
}

.reset-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #45a049, #3e8e41);
  transform: translateY(-2px);
}

.error-message {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 107, 107, 0.9);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  z-index: 1000;
  max-width: 90%;
}

.retry-btn {
  background: white;
  color: #ff6b6b;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  margin-top: 10px;
  cursor: pointer;
  font-weight: 600;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
  .user-greeting {
    text-align: center;
    margin-bottom: 10px;
  }
  .search-section {
    justify-content: center;
    margin-bottom: 15px;
  }
  .swipe-view {
    padding: 15px 10px;
  }
  
  .movie-card-container {
    margin: 5px 0;
    padding: 0 5px;
  }
  
  .swipe-actions {
    margin-top: 15px;
    padding: 5px 15px 15px;
  }
}

@media (max-width: 320px) {
  .swipe-view {
    padding: 10px 5px;
  }
  
  .movie-card {
    border-radius: 15px;
  }
  
  .movie-poster {
    height: clamp(200px, 45vh, 300px);
  }
}
</style> 