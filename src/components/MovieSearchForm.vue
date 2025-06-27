<template>
  <div class="movie-search-form">
    <div class="search-container">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for movies..."
        class="search-input"
        @input="searchMovies"
      />
      <button @click="loadRandomMovies" class="random-btn">
        Get Random Movie
      </button>
    </div>

    <div v-if="loading" class="loading">
      Searching movies...
    </div>

    <div v-if="searchQuery.length > 0 && searchQuery.length < 3" class="search-hint">
      Type at least 3 characters to search...
    </div>

    <div v-if="movies.length > 0" class="movies-list">
      <div 
        v-for="(movie, index) in movies" 
        :key="movie.id || index"
        class="movie-item"
        @click="selectMovie(movie)"
      >
        <img 
          v-if="movie.poster_path" 
          :src="getPosterUrl(movie.poster_path)"
          :alt="movie.title || 'Movie poster'"
          class="movie-poster"
        />
        <div class="movie-info">
          <h3 class="movie-title">{{ movie.title }}</h3>
          <p class="movie-year">{{ getYear(movie.release_date) }}</p>
          <p class="movie-overview">{{ truncateText(movie.overview, 120) }}</p>
          <div class="movie-rating" v-if="movie.vote_average">
            ⭐ {{ movie.vote_average.toFixed(1) }}
          </div>
        </div>
        <button class="select-btn" @click.stop="selectMovie(movie)">
          ❤️
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="cancel-btn">
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { moviesAPI, type MovieProfile } from '../services/api'

interface Props {
  group?: {
    id: string
    name: string
  } | null
}

defineProps<Props>()

const emit = defineEmits<{
  'movie-selected': [movie: MovieProfile]
  'cancel': []
}>()

const searchQuery = ref('')
const movies = ref<MovieProfile[]>([])
const loading = ref(false)
const error = ref('')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const searchMovies = async () => {
  console.log('Search called with:', `"${searchQuery.value}"`, 'Length:', searchQuery.value.length)
  
  if (!searchQuery.value.trim()) {
    console.log('Empty search, clearing movies')
    movies.value = []
    return
  }

  // Require at least 3 characters to search (increased from 2)
  if (searchQuery.value.trim().length < 3) {
    console.log('Search too short, minimum 3 characters required')
    movies.value = []
    return
  }

  console.log('Proceeding with search for:', searchQuery.value.trim())

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(async () => {
    try {
      loading.value = true
      error.value = ''
      
      console.log('Making API call for:', searchQuery.value.trim())
      const response = await moviesAPI.searchMovies(searchQuery.value.trim())
      movies.value = response.data || []
      console.log('Found movies:', movies.value.length)
    } catch (err: any) {
      console.error('Error searching movies:', err)
      if (err.response?.status === 500) {
        error.value = 'Movie search service is temporarily unavailable. Please try again later.'
      } else if (err.response?.status === 422) {
        error.value = 'Invalid search query. Please try a different search term.'
      } else {
        error.value = 'Failed to search movies'
      }
    } finally {
      loading.value = false
    }
  }, 500) // Increased debounce time to reduce server load
}

const selectMovie = async (movie: MovieProfile) => {
  try {
    // Like the movie (adds to favorites)
    if (movie.id) {
      await moviesAPI.likeMovie(movie.id)
      emit('movie-selected', movie)
    } else {
      error.value = 'Movie ID not available'
    }
  } catch (err: any) {
    console.error('Error liking movie:', err)
    error.value = 'Failed to add movie to favorites'
  }
}

const getPosterUrl = (posterPath: string) => {
  return `https://image.tmdb.org/t/p/w200${posterPath}`
}

const getYear = (dateString: string | null) => {
  if (!dateString) return ''
  return new Date(dateString).getFullYear().toString()
}

const truncateText = (text: string | null, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const loadRandomMovies = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('Making API call for random movie')
    const response = await moviesAPI.getRandomMovie()
    // Random movie returns a single movie, so we put it in an array
    movies.value = response.data ? [response.data] : []
    console.log('Found movies:', movies.value.length)
  } catch (err: any) {
    console.error('Error loading random movie:', err)
    if (err.response?.status === 500) {
      error.value = 'Movie service is temporarily unavailable. Please try again later.'
    } else if (err.response?.status === 422) {
      error.value = 'Invalid request. Please try again.'
    } else {
      error.value = 'Failed to load random movie'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.movie-search-form {
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-size: 16px;
  outline: none;
}

.search-input:focus {
  border-color: #4CAF50;
}

.search-input::placeholder {
  color: #888;
}

.loading {
  text-align: center;
  color: #888;
  padding: 20px;
}

.search-hint {
  text-align: center;
  color: #888;
  padding: 20px;
}

.movies-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  margin-bottom: 20px;
}

.movie-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: #1a1a1a;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-items: flex-start;
}

.movie-item:hover {
  background: #333;
}

.movie-poster {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.movie-info {
  flex: 1;
  min-width: 0;
}

.movie-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.movie-year {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #888;
}

.movie-overview {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #ccc;
  line-height: 1.3;
}

.movie-rating {
  font-size: 14px;
  color: #4CAF50;
}

.select-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.select-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #444;
}

.cancel-btn {
  padding: 10px 24px;
  background: #666;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background: #777;
}

.random-btn {
  padding: 10px 24px;
  background: #666;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  margin-left: 10px;
}

.random-btn:hover {
  background: #777;
}
</style> 