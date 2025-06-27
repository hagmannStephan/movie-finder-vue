<template>
  <div class="register-view">
    <div class="register-container">
      <div class="logo-section">
        <img src="../assets/MovieFinderLogo.svg" alt="MovieFinder" class="logo" />
        <h1 class="app-title">MovieFinder</h1>
        <p class="subtitle">Create your account</p>
      </div>

      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <input
            v-model="name"
            type="text"
            placeholder="Full Name"
            class="form-input"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="form-input"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="form-input"
            required
            :disabled="loading"
            minlength="8"
          />
        </div>

        <div class="form-group">
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            class="form-input"
            required
            :disabled="loading"
          />
        </div>

        <button 
          type="submit" 
          class="register-btn"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="login-link">
        <p>Already have an account?</p>
        <router-link to="/login" class="login-btn">Sign In</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return name.value.trim() && 
         email.value.trim() && 
         password.value.length >= 8 && 
         password.value === confirmPassword.value
})

const register = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill in all fields correctly'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await authAPI.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    })
    
    // Registration successful, now login automatically
    if (response.status === 200) {
      // Auto-login after successful registration
      const loginResponse = await authAPI.login(email.value.trim(), password.value)
      
      if (loginResponse.data?.access_token) {
        localStorage.setItem('authToken', loginResponse.data.access_token)
        router.push('/home')
      } else {
        // If auto-login fails, redirect to login page
        router.push('/login')
      }
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    error.value = err.response?.data?.detail || 'Failed to create account'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 20px;
}

.register-container {
  background: #2a2a2a;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.app-title {
  color: white;
  font-family: 'Bebas Neue', cursive;
  font-size: 32px;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.subtitle {
  color: #888;
  margin: 0;
  font-size: 16px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 16px;
  border: 2px solid #444;
  border-radius: 12px;
  background: #1a1a1a;
  color: white;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: #666;
}

.form-input::placeholder {
  color: #888;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-btn {
  padding: 16px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.login-link {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.login-link p {
  color: #888;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.login-btn {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-btn:hover {
  color: #45a049;
  text-decoration: underline;
}
</style> 