<template>
  <div class="home-view">
    <div class="groups-container">
      <!-- Favorites Section -->
      <div class="group-item favorites">
        <div class="group-content">
          <span class="group-name">Favorites</span>
        </div>
      </div>

      <!-- Groups List -->
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
            >
              ⚙️
            </button>
            <button 
              class="delete-btn" 
              @click="confirmLeaveGroup(group)"
              v-if="!group.isOwner"
              title="Leave Group"
            >
              ✕
            </button>
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
    <div v-if="showCreateGroupModal" class="modal-overlay" @click="closeCreateGroupModal">
      <div class="modal-content" @click.stop>
        <h2>Create Group</h2>
        <CreateGroupForm 
          @created="onGroupCreated" 
          @cancel="closeCreateGroupModal"
        />
      </div>
    </div>

    <!-- Edit Group Modal -->
    <div v-if="showEditGroupModal" class="modal-overlay" @click="closeEditGroupModal">
      <div class="modal-content" @click.stop>
        <h2>Edit Group</h2>
        <EditGroupForm 
          :group="selectedGroup"
          @group-updated="onGroupUpdated" 
          @group-deleted="onGroupDeleted"
          @cancel="closeEditGroupModal"
        />
      </div>
    </div>

    <!-- Leave Group Confirmation Modal -->
    <div v-if="showLeaveConfirmModal" class="modal-overlay" @click="closeLeaveConfirmModal">
      <div class="confirmation-modal" @click.stop>
        <p>Are you sure you want to leave {{ selectedGroup?.name }}?</p>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div class="confirmation-buttons">
          <button class="stay-btn" @click="closeLeaveConfirmModal">Stay</button>
          <button class="leave-btn" @click="leaveGroup">Leave</button>
        </div>
      </div>
    </div>

    <!-- Movie Search Modal -->
    <div v-if="showMovieSearchModal" class="modal-overlay" @click="closeMovieSearchModal">
      <div class="modal-content movie-search-modal" @click.stop>
        <h2>Add Movies to {{ selectedGroup?.name }}</h2>
        <MovieSearchForm 
          :group="selectedGroup"
          @movie-selected="onMovieSelected"
          @cancel="closeMovieSearchModal"
        />
      </div>
    </div>

    <!-- View Members Modal -->
    <div v-if="showViewMembersModal" class="modal-overlay" @click="closeViewMembersModal">
      <div class="modal-content view-members-modal" @click.stop>
        <h2>Members of {{ selectedGroup?.name }}</h2>
        
        <!-- Debug Info -->
        <div class="debug-info" style="background: #333; padding: 10px; margin-bottom: 10px; font-size: 12px;">
          <strong>Debug Info:</strong><br>
          Total members: {{ groupMembers.length }}<br>
          Raw data: {{ JSON.stringify(groupMembers) }}
        </div>
        
        <div class="members-list">
          <div v-if="groupMembers.length === 0" class="no-members">
            No members found
          </div>
          <div 
            v-for="member in groupMembers" 
            :key="member.user_id" 
            class="member-item"
          >
            <strong>{{ member.name }}</strong> (ID: {{ member.user_id }})
          </div>
        </div>
        <div class="modal-footer">
          <button class="close-btn" @click="closeViewMembersModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { groupsAPI } from '../services/api'
import CreateGroupForm from '../components/CreateGroupForm.vue'
import EditGroupForm from '../components/EditGroupForm.vue'
import api from '../services/api'
import MovieSearchForm from '../components/MovieSearchForm.vue'

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

const groups = ref<GroupDisplay[]>([])
const showCreateGroupModal = ref(false)
const showEditGroupModal = ref(false)
const showLeaveConfirmModal = ref(false)
const showAddFavoriteModal = ref(false)
const showMovieSearchModal = ref(false)
const showViewMembersModal = ref(false)
const selectedGroup = ref<GroupDisplay | null>(null)
const groupMembers = ref<{user_id: number, name: string}[]>([])
const loading = ref(false)
const error = ref('')
const currentUserId = ref<number>(0)

onMounted(async () => {
  // Get current user ID first
  try {
    const userResponse = await api.get('/users/me')
    currentUserId.value = userResponse.data.user_id
  } catch (err) {
    console.error('Error getting user info:', err)
  }
  loadGroups()
})

const loadGroups = async () => {
  try {
    loading.value = true
    const response = await groupsAPI.getGroups()
    console.log('Groups response:', response.data)
    
    // Transform API response to display format
    groups.value = response.data.map((group: Group) => ({
      id: group.group_id,
      name: group.name,
      isOwner: group.admin_id === currentUserId.value,
      memberCount: 0 // TODO: Get actual member count from API
    }))
  } catch (err) {
    console.error('Error loading groups:', err)
    error.value = 'Failed to load groups'
  } finally {
    loading.value = false
  }
}

const closeCreateGroupModal = () => {
  showCreateGroupModal.value = false
}

const closeEditGroupModal = () => {
  showEditGroupModal.value = false
  selectedGroup.value = null
}

const closeLeaveConfirmModal = () => {
  showLeaveConfirmModal.value = false
  selectedGroup.value = null
}

const closeMovieSearchModal = () => {
  showMovieSearchModal.value = false
  selectedGroup.value = null
}

const closeViewMembersModal = () => {
  showViewMembersModal.value = false
  selectedGroup.value = null
}

const editGroup = (group: GroupDisplay) => {
  selectedGroup.value = group
  showEditGroupModal.value = true
}

const confirmLeaveGroup = (group: GroupDisplay) => {
  selectedGroup.value = group
  error.value = '' // Clear any previous errors
  showLeaveConfirmModal.value = true
}

const leaveGroup = async () => {
  if (!selectedGroup.value) return
  
  try {
    console.log('=== LEAVE GROUP DEBUG ===')
    console.log('Attempting to leave group:', selectedGroup.value)
    console.log('Current user ID:', currentUserId.value)
    console.log('Is user owner of this group?', selectedGroup.value.isOwner)
    
    // Double-check: Don't allow owners to leave their own groups
    if (selectedGroup.value.isOwner) {
      error.value = 'You cannot leave a group that you created. Delete the group instead.'
      console.log('ERROR: Owner trying to leave own group')
      return
    }
    
    // First, check if user is actually a member of this group
    try {
      const groupResponse = await groupsAPI.getGroupWithMembers(selectedGroup.value.id)
      const groupData = groupResponse.data
      
      console.log('Group data for leave check:', groupData)
      console.log('Group members:', groupData.members)
      console.log('Is current user in members list?', groupData.members.includes(currentUserId.value))
      
      if (!groupData.members.includes(currentUserId.value)) {
        error.value = 'You are not a member of this group.'
        console.log('ERROR: User not in group members list')
        return
      }
      
      // Check if user is admin
      if (groupData.admin_id === currentUserId.value) {
        error.value = 'You cannot leave a group that you administer. Delete the group instead.'
        console.log('ERROR: Admin trying to leave administered group')
        return
      }
      
    } catch (checkErr) {
      console.error('Error checking group membership:', checkErr)
      error.value = 'Failed to verify group membership'
      return
    }
    
    console.log('User is verified member, proceeding with leave...')
    await groupsAPI.leaveGroup(selectedGroup.value.id)
    console.log('Successfully left group:', selectedGroup.value.name)
    await loadGroups() // Reload groups after leaving
    closeLeaveConfirmModal()
  } catch (err: any) {
    console.error('Error leaving group:', err)
    
    // Handle specific error cases
    if (err.response?.status === 404) {
      error.value = 'Group not found or you are not a member of this group'
    } else if (err.response?.status === 401) {
      error.value = 'You are not authorized to leave this group. This may be because you are the group administrator.'
    } else if (err.response?.status === 422) {
      error.value = 'Invalid request to leave group'
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to leave this group'
    } else {
      error.value = 'Failed to leave group. This may be because you are the group administrator.'
    }
    
    // Don't close the modal if there's an error, so user can see the error message
    console.log('Leave group error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    })
  }
}

const onGroupCreated = () => {
  loadGroups()
  closeCreateGroupModal()
}

const onGroupUpdated = () => {
  loadGroups()
  closeEditGroupModal()
}

const onGroupDeleted = () => {
  loadGroups()
  closeEditGroupModal()
}

const addMovieToGroup = (group: GroupDisplay) => {
  // Navigate to movie search/selection for this group
  console.log('Add movie to group:', group.name)
  // TODO: Navigate to movie selection view with group context
  // For now, let's implement a simple movie search modal
  selectedGroup.value = group
  showMovieSearchModal.value = true
}

const openCreateGroupModal = () => {
  console.log('Opening create group modal')
  showCreateGroupModal.value = true
  console.log('showCreateGroupModal is now:', showCreateGroupModal.value)
}

const onMovieSelected = (movie: any) => {
  // Handle movie selection
  console.log('Movie selected:', movie.title, 'for group:', selectedGroup.value?.name)
  // Show success message
  alert(`"${movie.title}" has been added to your favorites! Group matches will be updated automatically.`)
  closeMovieSearchModal()
}

const viewMembers = async (group: GroupDisplay) => {
  console.log('=== VIEW MEMBERS DEBUG ===')
  console.log('View members of group:', group.name, 'ID:', group.id)
  selectedGroup.value = group
  
  try {
    // Load group details to get member IDs
    console.log('Loading group details for view members...')
    const groupResponse = await groupsAPI.getGroupWithMembers(group.id)
    const groupData = groupResponse.data
    
    console.log('Group data for members view:', groupData)
    console.log('Members array from API:', groupData.members)
    console.log('Current user ID:', currentUserId.value)
    console.log('Group admin ID:', groupData.admin_id)
    
    // Since we can't get individual user details, just show user IDs
    if (groupData.members && groupData.members.length > 0) {
      console.log('Processing', groupData.members.length, 'members...')
      
      groupMembers.value = groupData.members.map((userId: number) => {
        const isCurrentUser = userId === currentUserId.value
        const isAdmin = userId === groupData.admin_id
        
        let name = `User ${userId}`
        if (isCurrentUser) name = 'You'
        if (isAdmin) name += ' (Admin)'
        
        console.log(`Member ${userId}: name="${name}", isCurrentUser=${isCurrentUser}, isAdmin=${isAdmin}`)
        
        return {
          user_id: userId,
          name: name
        }
      })
      
      console.log('Final processed members:', groupMembers.value)
    } else {
      console.log('No members found in group data')
      groupMembers.value = []
    }
    
    console.log('Opening view members modal with', groupMembers.value.length, 'members')
    showViewMembersModal.value = true
  } catch (err) {
    console.error('Error loading group members:', err)
    console.error('Error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    })
    error.value = 'Failed to load group members'
  }
}
</script>

<style scoped>
.home-view {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-item {
  background: #2a2a2a;
  border-radius: 25px;
  padding: 12px 20px;
  color: white;
}

.group-item.favorites {
  background: #1a1a1a;
}

.group-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-size: 16px;
  font-weight: 500;
}

.group-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.add-btn, .settings-btn, .delete-btn, .members-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.add-btn:hover, .settings-btn:hover, .members-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.2);
}

.add-group-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.add-group-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  min-width: 200px;
  justify-content: center;
}

.add-group-btn:hover {
  background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

.add-group-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.plus-icon {
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
}

.btn-text {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
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

.modal-content {
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  color: white;
}

.movie-search-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  text-align: center;
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

.confirmation-modal .error-message {
  color: #ff6b6b;
  text-align: center;
  margin: 12px 0;
  font-size: 14px;
  background: rgba(255, 107, 107, 0.1);
  padding: 8px;
  border-radius: 4px;
}

.confirmation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.stay-btn, .leave-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.stay-btn {
  background: #4CAF50;
  color: white;
}

.leave-btn {
  background: #f44336;
  color: white;
}

.stay-btn:hover {
  background: #45a049;
}

.leave-btn:hover {
  background: #da190b;
}

.view-members-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.members-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  padding: 8px 0;
  border-bottom: 1px solid #444;
}

.modal-footer {
  text-align: right;
  margin-top: 20px;
}

.close-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  background: #f44336;
  color: white;
}

.close-btn:hover {
  background: #da190b;
}
</style> 