<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../services/api'
import "../css/main.css"

const router = useRouter()

interface UserProfile {
  user_id: number
  name: string
  email: string
  friend_code: string
}

const userProfile = ref<UserProfile | null>(null)
const showLogoutConfirm = ref(false)

onMounted(() => {
  loadUserProfile()
})

const loadUserProfile = async () => {
  try {
    const response = await authAPI.getProfile()
    console.log('User profile response:', response.data)
    userProfile.value = response.data
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}

const copyFriendCode = async () => {
  if (!userProfile.value?.friend_code) return
  
  try {
    await navigator.clipboard.writeText(userProfile.value.friend_code)
    // Could add a toast notification here
    console.log('Friend code copied to clipboard')
  } catch (err) {
    console.error('Failed to copy friend code:', err)
  }
}

const confirmLogout = () => {
  showLogoutConfirm.value = true
}

const closeLogoutConfirm = () => {
  showLogoutConfirm.value = false
}

const logout = async () => {
  try {
    await authAPI.logout()
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    // Clear local storage and redirect regardless of API response
    localStorage.removeItem('authToken')
    router.push('/login')
  }
}
</script>

<template>
  <div class="settings-view">
    <div class="settings-container">
      <h1 class="settings-title">Settings</h1>

      <!-- Profile Section -->
      <div class="settings-section">
        <h2 class="section-title">Profile</h2>
        <div class="profile-info" v-if="userProfile">
          <div class="profile-item">
            <label>Name:</label>
            <span>{{ userProfile.name }}</span>
          </div>
          <div class="profile-item">
            <label>Email:</label>
            <span>{{ userProfile.email }}</span>
          </div>
          <div class="profile-item">
            <label>Friend Code:</label>
            <div class="friend-code-container">
              <span class="friend-code">{{ userProfile.friend_code }}</span>
              <button @click="copyFriendCode" class="copy-btn" title="Copy Friend Code">📋</button>
            </div>
          </div>
        </div>
        <div v-else class="loading">Loading profile...</div>
      </div>

      <!-- App Info Section -->
      <div class="settings-section">
        <h2 class="section-title">About</h2>
        <div class="app-info">
          <div class="info-item">
            <label>Version:</label>
            <span>1.0.0</span>
          </div>
          <div class="info-item">
            <label>MovieFinder:</label>
            <span>Find and share movies with friends</span>
          </div>
        </div>
      </div>

      <!-- Logout Section -->
      <div class="settings-section danger-section">
        <button @click="confirmLogout" class="logout-btn">
          Logout
        </button>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click="closeLogoutConfirm">
      <div class="confirmation-modal" @click.stop>
        <p>Are you sure you want to logout?</p>
        <div class="confirmation-buttons">
          <button @click="closeLogoutConfirm" class="cancel-btn">Cancel</button>
          <button @click="logout" class="confirm-btn">Logout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
  color: white;
}

.settings-container {
  background: #2a2a2a;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.settings-title {
  text-align: center;
  margin: 0 0 30px 0;
  font-size: 28px;
  font-weight: 600;
  color: white;
}

.settings-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #444;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #4CAF50;
}

.profile-info, .app-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-item, .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 8px;
}

.profile-item label, .info-item label {
  font-weight: 500;
  color: #888;
}

.profile-item span, .info-item span {
  color: white;
}

.friend-code-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.friend-code {
  font-family: monospace;
  background: #1a1a1a;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #444;
  color: #4CAF50;
  font-weight: 500;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  color: #888;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.loading {
  text-align: center;
  color: #888;
  padding: 20px;
}

.logout-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #333;
  text-align: center;
}

.logout-btn {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: #b71c1c;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-modal {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  max-width: 300px;
  width: 90%;
  color: white;
  text-align: center;
}

.confirmation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.cancel-btn, .confirm-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background: #4CAF50;
  color: white;
}

.confirm-btn {
  background: #f44336;
  color: white;
}

.cancel-btn:hover {
  background: #45a049;
}

.confirm-btn:hover {
  background: #da190b;
}
</style>
