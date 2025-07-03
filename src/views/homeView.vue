<template>
  <div class="home-view">
    <div class="groups-container">
      <!-- Favorites Section -->
      <div class="group-item favorites">
        <div class="group-content">
          <span class="group-name">Favorites</span>
          <ul class="favorite-movie-list">
            <li v-for="movie in favorites" :key="movie.id">
              <img v-if="movie.poster_path" :src="'https://image.tmdb.org/t/p/w200' + movie.poster_path" :alt="movie.title || 'Poster'" />
              <div class="favorite-title">{{ movie.title }}</div>
              <div class="favorite-year">{{ movie.release_date ? new Date(movie.release_date).getFullYear() : '' }}</div>
              <button class="favorite-remove" @click="removeFavorite(movie.id)" title="Entfernen">❤️</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Groups List -->
      <div class="groups-section">
        <h3 class="section-title">Groups</h3>
        <div class="groups-list">
          <div 
            v-for="group in groups" 
            :key="group.id" 
            class="group-item"
          >
            <div class="group-content">
              <span class="group-name">{{ group.name }}</span>
              <div class="group-actions">
                <button 
                  class="settings-btn" 
                  @click="editGroup(group)"
                  v-if="group.isOwner"
                  title="Edit Group (Admin only)"
                >⚙️</button>
                <button 
                  class="delete-btn" 
                  @click="confirmLeaveGroup(group)"
                  v-if="!group.isOwner"
                  title="Leave Group"
                >✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Group Button -->
      <div class="add-group-section">
        <button class="add-group-btn" @click="openCreateGroupModal">
          <span class="plus-icon">+</span>
          <span class="btn-text">Create New Group</span>
        </button>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div v-if="showCreateGroupModal" class="modal-overlay" @click.self="closeCreateGroupModal">
      <div class="modal-content">
        <CreateGroupForm @created="onGroupCreated" @cancel="closeCreateGroupModal" />
      </div>
    </div>

    <!-- Edit Group Modal -->
    <div v-if="showEditGroupModal" class="modal-overlay" @click.self="closeEditGroupModal">
      <div class="modal-content">
        <EditGroupForm 
          :group="selectedGroup" 
          @group-updated="onGroupUpdated" 
          @group-deleted="onGroupDeleted" 
          @cancel="closeEditGroupModal" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, onBeforeUnmount } from 'vue'
import { groupsAPI } from '../services/api'
import CreateGroupForm from '../components/CreateGroupForm.vue'
import EditGroupForm from '../components/EditGroupForm.vue'
import api, { moviesAPI } from '../services/api'

interface MovieProfile {
  id: number
  title: string
  release_date: string
  poster_path?: string
}

interface Group {
  group_id: number
  name: string
  admin_id: number
  show_movies: boolean
  show_tv: boolean
  settings_movies: object | null
  settings_tv: object | null
  created_on: string
}

interface GroupDisplay {
  id: number
  name: string
  isOwner: boolean
  memberCount: number
}

const favorites = ref<MovieProfile[]>([])
const groups = ref<GroupDisplay[]>([])
const showCreateGroupModal = ref(false)
const showEditGroupModal = ref(false)
const showLeaveConfirmModal = ref(false)
const selectedGroup = ref<GroupDisplay | null>(null)
const groupMembers = ref<{user_id: number, name: string}[]>([])
const loading = ref(false)
const error = ref('')
const currentUserId = ref<number>(0)

const loadFavorites = async () => {
  try {
    const response = await moviesAPI.getFavorites()
    favorites.value = response.data
  } catch (err) {
    console.error('Fehler beim Laden der Favoriten:', err)
  }
}

onMounted(async () => {
  try {
    const userResponse = await api.get('/users/me')
    currentUserId.value = userResponse.data.user_id
  } catch (err) {
    console.error('Error getting user info:', err)
  }
  await loadGroups()
  await loadFavorites()

  // Event-Listener für Favoriten-Update
  const internalInstance = getCurrentInstance()
  if (internalInstance && internalInstance.appContext.config.globalProperties) {
    const globalProps = internalInstance.appContext.config.globalProperties
    if (globalProps.$on) {
      globalProps.$on('favorites-updated', loadFavorites)
    }
  }
})

onBeforeUnmount(() => {
  // Event-Listener entfernen
  const internalInstance = getCurrentInstance()
  if (internalInstance && internalInstance.appContext.config.globalProperties) {
    const globalProps = internalInstance.appContext.config.globalProperties
    if (globalProps.$off) {
      globalProps.$off('favorites-updated', loadFavorites)
    }
  }
})

const loadGroups = async () => {
  try {
    loading.value = true
    const response = await groupsAPI.getGroups()
    groups.value = response.data.map((group: Group) => ({
      id: group.group_id,
      name: group.name,
      isOwner: group.admin_id === currentUserId.value,
      memberCount: 0
    }))
  } catch (err) {
    console.error('Error loading groups:', err)
    error.value = 'Failed to load groups'
  } finally {
    loading.value = false
  }
}

const editGroup = (group: GroupDisplay) => {
  // TODO: Implement group editing
  showEditGroupModal.value = true
  selectedGroup.value = group
}

const confirmLeaveGroup = (group: GroupDisplay) => {
  // TODO: Implement leave group confirmation
  showLeaveConfirmModal.value = true
  selectedGroup.value = group
}

const openCreateGroupModal = () => {
  // TODO: Implement create group modal
  showCreateGroupModal.value = true
}

const removeFavorite = async (movieId: number) => {
  try {
    await moviesAPI.removeFromFavorites(movieId)
    await loadFavorites()
  } catch (err) {
    console.error('Fehler beim Entfernen des Favoriten:', err)
  }
}

const closeCreateGroupModal = () => {
  showCreateGroupModal.value = false
}

const onGroupCreated = async () => {
  showCreateGroupModal.value = false
  await loadGroups()
}

const closeEditGroupModal = () => {
  showEditGroupModal.value = false
  selectedGroup.value = null
}

const onGroupUpdated = async () => {
  showEditGroupModal.value = false
  selectedGroup.value = null
  await loadGroups()
}

const onGroupDeleted = async () => {
  showEditGroupModal.value = false
  selectedGroup.value = null
  await loadGroups()
}
</script>

<style scoped>
.favorite-movie-list {
  margin-top: 1rem;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1.5rem;
  justify-content: center;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #4caf50 #23272f;
}
.favorite-movie-list::-webkit-scrollbar {
  height: 10px;
}
.favorite-movie-list::-webkit-scrollbar-thumb {
  background: #4caf50;
  border-radius: 8px;
}
.favorite-movie-list::-webkit-scrollbar-track {
  background: #23272f;
  border-radius: 8px;
}
.favorite-movie-list li {
  background: #23272f;
  color: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  padding: 1rem 1.2rem 1rem 1rem;
  min-width: 180px;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: box-shadow 0.2s, transform 0.2s;
  flex: 0 0 auto;
}
.favorite-movie-list li:hover {
  box-shadow: 0 8px 32px rgba(76,175,80,0.18);
  transform: translateY(-2px) scale(1.03);
}
.favorite-movie-list img {
  width: 90px;
  height: 135px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.7rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.favorite-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.2rem;
  text-align: center;
}
.favorite-year {
  font-size: 0.95rem;
  color: #4caf50;
  margin-bottom: 0.5rem;
}
.favorite-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.3rem;
  cursor: pointer;
  transition: color 0.2s;
}
.favorite-remove:hover {
  color: #ff2e2e;
}
@media (max-width: 600px) {
  .favorite-movie-list {
    gap: 0.7rem;
    justify-content: center;
  }
  .favorite-movie-list li {
    min-width: 120px;
    max-width: 140px;
    padding: 0.7rem 0.5rem 0.7rem 0.5rem;
  }
  .favorite-movie-list img {
    width: 60px;
    height: 90px;
  }
  .favorite-title {
    font-size: 0.95rem;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #23272f;
  border-radius: 16px;
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  color: #fff;
}
.groups-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.section-title {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.groups-list::-webkit-scrollbar {
  width: 8px;
}

.groups-list::-webkit-scrollbar-thumb {
  background: #4caf50;
  border-radius: 4px;
}

.groups-list::-webkit-scrollbar-track {
  background: #23272f;
  border-radius: 4px;
}

.group-item {
  background: #23272f;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  border: 1px solid #333;
}

.group-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(76,175,80,0.15);
  border-color: #4caf50;
}

.group-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.group-actions {
  display: flex;
  gap: 0.5rem;
}

.settings-btn, .delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background: rgba(76,175,80,0.2);
  color: #4caf50;
}

.delete-btn:hover {
  background: rgba(255,107,107,0.2);
  color: #ff6b6b;
}

.add-group-section {
  margin-top: 2rem;
  text-align: center;
}

.add-group-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(76,175,80,0.3);
}

.add-group-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(76,175,80,0.4);
  background: linear-gradient(135deg, #45a049, #3e8e41);
}

.plus-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.btn-text {
  font-size: 1rem;
}
</style>
