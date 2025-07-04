<template>
  <div class="edit-group-form">
    <form @submit.prevent="updateGroup">
      <div class="form-group">
        <input
          v-model="groupName"
          type="text"
          placeholder="Edit Group name"
          class="group-name-input"
          required
        />
      </div>

      <!-- Members Management Section (Only for Admins) -->
      <div class="members-section" v-if="groupData && groupData.admin_id === currentUserId">
        <h3 class="section-title">Group Members ({{ members.length }})</h3>
        
        <!-- Members List -->
        <div class="members-list" v-if="members.length > 0">
          <div 
            v-for="member in members" 
            :key="member.user_id" 
            class="member-item"
          >
            <div class="member-info">
              <span class="member-name">{{ member.name }}</span>
              <span class="member-role" v-if="member.user_id === currentUserId">(You)</span>
              <span class="member-role" v-if="member.user_id === groupData?.admin_id">(Admin)</span>
            </div>
            <button 
              type="button"
              @click="removeMember(member.user_id)"
              class="remove-member-btn"
              v-if="member.user_id !== groupData?.admin_id && member.user_id !== currentUserId"
              title="Remove member"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Add Member Section -->
        <div class="add-member-section">
          <h4 class="add-member-title">Add New Member</h4>
          <div class="add-member-form">
            <input
              v-model="newMemberCode"
              type="text"
              placeholder="Enter friend code"
              class="friend-code-input"
              :disabled="addingMember"
            />
            <button 
              type="button"
              @click="addMember"
              class="add-member-btn"
              :disabled="!newMemberCode.trim() || addingMember"
            >
              {{ addingMember ? 'Adding...' : 'Add' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Non-Admin Message -->
      <div class="members-section" v-else-if="groupData && groupData.admin_id !== currentUserId">
        <h3 class="section-title">Group Members ({{ members.length }})</h3>
        
        <!-- Members List for Non-Admins (Read-only) -->
        <div class="members-list" v-if="members.length > 0">
          <div 
            v-for="member in members" 
            :key="member.user_id" 
            class="member-item"
          >
            <div class="member-info">
              <span class="member-name">{{ member.name }}</span>
              <span class="member-role" v-if="member.user_id === currentUserId">(You)</span>
              <span class="member-role" v-if="member.user_id === groupData?.admin_id">(Admin)</span>
            </div>
          </div>
        </div>
        
        <p class="admin-only-message">Only the group admin can add or remove members.</p>
      </div>

      <div class="form-actions">
        <button type="button" @click="cancel" class="cancel-btn">Cancel</button>
        <button type="submit" :disabled="!groupName.trim() || loading" class="update-btn">
          {{ loading ? 'Updating...' : 'Update' }}
        </button>
      </div>
    </form>

    <div class="danger-zone">
      <button type="button" @click="confirmDelete" class="delete-btn">
        Delete Group
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
      <div class="confirmation-modal" @click.stop>
        <p>Are you sure you want to delete "{{ group?.name }}"?</p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="confirmation-buttons">
          <button @click="closeDeleteConfirm" class="cancel-delete-btn">Cancel</button>
          <button @click="deleteGroup" class="confirm-delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { groupsAPI } from '../services/api'
import api from '../services/api'

interface Group {
  id: number
  name: string
  isOwner: boolean
  memberCount: number
}

interface GroupData {
  group_id: number
  name: string
  admin_id: number
  members: number[]
  show_movies: boolean
  show_tv: boolean
  created_on: string
}

interface Member {
  user_id: number
  name: string
}

const props = defineProps<{
  group: Group | null
}>()

const emit = defineEmits<{
  'group-updated': []
  'group-deleted': []
  'cancel': []
}>()

const groupName = ref('')
const groupData = ref<GroupData | null>(null)
const members = ref<Member[]>([])
const newMemberCode = ref('')
const currentUserId = ref<number>(0)
const loading = ref(false)
const addingMember = ref(false)
const error = ref('')
const showDeleteConfirm = ref(false)

onMounted(async () => {
  if (props.group) {
    groupName.value = props.group.name
    
    // Get current user ID
    try {
      const userResponse = await api.get('/users/me')
      currentUserId.value = userResponse.data.user_id
    } catch (err) {
      console.error('Error getting current user:', err)
    }
    
    await loadGroupDetails()
  }
})

const loadGroupDetails = async (source = 'initial') => {
  if (!props.group) return

  try {
    loading.value = true
    
    console.log(`=== LOAD GROUP DETAILS (${source}) ===`)
    console.log('Loading group details for group:', props.group.id)
    console.log('Current user ID:', currentUserId.value)
    
    // Get group details with members
    const groupResponse = await groupsAPI.getGroupWithMembers(props.group.id)
    groupData.value = groupResponse.data
    
    // console.log(`[${source}] Group data loaded:`, groupData.value)
    // console.log(`[${source}] Group admin_id:`, groupData.value.admin_id)
    // console.log(`[${source}] Is current user admin?`, groupData.value.admin_id === currentUserId.value)
    
    // Since we can't get individual user details, just show user IDs
    if (groupData.value && groupData.value.members && groupData.value.members.length > 0) {
      console.log(`[${source}] Member IDs:`, groupData.value.members)
      
      members.value = groupData.value.members.map((userId: number) => ({
        user_id: userId,
        name: userId === currentUserId.value ? 'You' : `User ${userId}`
      }))
      
      console.log(`[${source}] Members processed:`, members.value)
    } else {
      console.log(`[${source}] No members found in group data`)
      members.value = []
    }
    
    console.log(`[${source}] Group details loaded successfully`)
  } catch (err: any) {
    console.error(`[${source}] Error loading group details:`, err)
    console.error(`[${source}] Error details:`, {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    })
    error.value = 'Failed to load group details'
  } finally {
    loading.value = false
  }
}

const addMember = async () => {
  if (!props.group || !newMemberCode.value.trim()) return

  try {
    addingMember.value = true
    error.value = ''
    
    console.log('=== ADD MEMBER DEBUG ===')
    console.log('Adding member to group:', props.group.id)
    console.log('Friend code:', newMemberCode.value.trim())
    console.log('Current user ID:', currentUserId.value)
    console.log('Group admin ID:', groupData.value?.admin_id)
    console.log('Is current user admin?', groupData.value?.admin_id === currentUserId.value)
    console.log('Group data:', groupData.value)
    console.log('Props group:', props.group)
    
    // Check if user is admin
    if (groupData.value && groupData.value.admin_id !== currentUserId.value) {
      error.value = 'You are not the admin of this group. Only admins can add members.'
      console.log('ERROR: User is not admin!')
      return
    }
    
    // Check if we have auth token
    const token = localStorage.getItem('authToken')
    console.log('Auth token exists:', !!token)
    console.log('Auth token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
    
    console.log('Making API call to add member...')
    const addMemberResponse = await groupsAPI.addMemberToGroup(props.group.id, newMemberCode.value.trim())
    
    console.log('Add member API response:', addMemberResponse.data)
    console.log('Member added successfully!')
    
    // Reload group details to show new member
    console.log('Reloading group details after adding member...')
    await loadGroupDetails('after-add-member')
    newMemberCode.value = ''
    
  } catch (err: any) {
    console.log('=== ADD MEMBER ERROR ===')
    console.error('Error adding member:', err)
    console.error('Error details:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      config: err.config
    })
    
    if (err.response?.data) {
      console.error('API Error Response:', err.response.data)
    }
    
    if (err.response?.status === 404) {
      error.value = 'Friend code not found'
    } else if (err.response?.status === 401) {
      error.value = 'You are not authorized to add members to this group. Only the group admin can add members.'
      console.log('401 Error - checking auth state...')
      console.log('Current user ID:', currentUserId.value)
      console.log('Group admin ID:', groupData.value?.admin_id)
      console.log('Auth token exists:', !!localStorage.getItem('authToken'))
    } else if (err.response?.status === 422) {
      error.value = 'Invalid friend code or user already in group'
    } else {
      error.value = err.response?.data?.detail || 'Failed to add member'
    }
  } finally {
    addingMember.value = false
  }
}

const removeMember = async (userId: number) => {
  if (!props.group) return

  // Confirm removal
  const member = members.value.find(m => m.user_id === userId)
  if (!member || !confirm(`Remove ${member.name} from the group?`)) return

  try {
    loading.value = true
    error.value = ''
    
    await groupsAPI.removeMemberFromGroup(props.group.id, userId)
    
    // Reload group details to update member list
    await loadGroupDetails('after-remove-member')
    
    console.log('Member removed successfully')
  } catch (err: any) {
    console.error('Error removing member:', err)
    if (err.response?.status === 404) {
      error.value = 'Member not found'
    } else if (err.response?.status === 401) {
      error.value = 'You are not authorized to remove this member'
    } else {
      error.value = err.response?.data?.detail || 'Failed to remove member'
    }
  } finally {
    loading.value = false
  }
}

const updateGroup = async () => {
  if (!props.group || !groupName.value.trim()) return

  try {
    loading.value = true
    error.value = ''
    
    await groupsAPI.updateGroup(props.group.id, {
      name: groupName.value.trim(),
      admin_id: groupData.value?.admin_id
    })
    
    emit('group-updated')
  } catch (err: any) {
    console.error('Error updating group:', err)
    console.error('Request data:', {
      name: groupName.value.trim(),
      admin_id: groupData.value?.admin_id
    })
    
    if (err.response?.status === 422) {
      console.error('Validation error details:', err.response.data)
      error.value = 'Invalid group data. Please check all fields.'
    } else {
      error.value = err.response?.data?.detail || 'Failed to update group'
    }
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
}

const deleteGroup = async () => {
  if (!props.group) return

  try {
    loading.value = true
    error.value = ''
    
    await groupsAPI.deleteGroup(props.group.id)
    
    emit('group-deleted')
  } catch (err: any) {
    console.error('Error deleting group:', err)
    error.value = err.response?.data?.detail || 'Failed to delete group'
  } finally {
    loading.value = false
    closeDeleteConfirm()
  }
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.edit-group-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.group-name-input, .description-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-size: 16px;
  outline: none;
  resize: vertical;
}

.group-name-input:focus, .description-input:focus {
  border-color: #666;
}

.group-name-input::placeholder, .description-input::placeholder {
  color: #888;
}

/* Members Section */
.members-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
}

.section-title {
  color: #fff;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.members-list {
  margin-bottom: 20px;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #2a2a2a;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #333;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.member-role {
  color: #888;
  font-size: 12px;
  font-style: italic;
}

.remove-member-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 16px;
}

.remove-member-btn:hover {
  background: rgba(255, 107, 107, 0.2);
}

/* Add Member Section */
.add-member-section {
  border-top: 1px solid #333;
  padding-top: 16px;
}

.add-member-title {
  color: #ccc;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.add-member-form {
  display: flex;
  gap: 8px;
}

.friend-code-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: white;
  font-size: 14px;
  outline: none;
}

.friend-code-input:focus {
  border-color: #666;
}

.friend-code-input::placeholder {
  color: #888;
}

.add-member-btn {
  padding: 10px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.add-member-btn:hover:not(:disabled) {
  background: #45a049;
}

.add-member-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-only-message {
  color: #888;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
  font-style: italic;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn, .update-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.cancel-btn {
  background: #444;
  color: white;
}

.update-btn {
  background: #4CAF50;
  color: white;
  flex: 1;
}

.cancel-btn:hover {
  background: #555;
}

.update-btn:hover:not(:disabled) {
  background: #45a049;
}

.update-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.danger-zone {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #444;
}

.delete-btn {
  width: 100%;
  padding: 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background: #ff5252;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
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

.warning-text {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 8px;
}

.confirmation-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.cancel-delete-btn, .confirm-delete-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-delete-btn {
  background: #4CAF50;
  color: white;
}

.confirm-delete-btn {
  background: #f44336;
  color: white;
}

.cancel-delete-btn:hover {
  background: #45a049;
}

.confirm-delete-btn:hover {
  background: #da190b;
}
</style> 