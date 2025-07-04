<template>
  <div class="create-group-form">
    <form @submit.prevent="createGroup">
      <div class="form-group">
        <label for="groupName">Group Name</label>
        <input
          id="groupName"
          v-model="groupName"
          type="text"
          placeholder="Enter group name"
          class="group-name-input"
          required
        />
      </div>

      <div class="form-group">
        <label for="memberCode">Add Members (Friend Codes) *</label>
        <p class="help-text">At least one member is required to create a group</p>
        <div class="member-input-container">
          <input
            id="memberCode"
            v-model="newMemberCode"
            type="text"
            placeholder="Enter friend code"
            @keyup.enter="addMember"
          />
          <button type="button" @click="addMember" class="add-member-btn" :disabled="!newMemberCode.trim()">
            Add
          </button>
        </div>
        <div v-if="memberCodes.length > 0" class="member-list">
          <div v-for="(code, index) in memberCodes" :key="index" class="member-item">
            <span class="member-code">{{ code }}</span>
            <button type="button" @click="removeMember(index)" class="remove-member-btn">×</button>
          </div>
        </div>
        <div v-if="memberCodes.length === 0" class="no-members-warning">
          ⚠️ Please add at least one member to create the group
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="cancel" class="cancel-btn">-</button>
        <button type="submit" :disabled="!groupName.trim() || memberCodes.length === 0 || loading" class="submit-btn">
          {{ loading ? '...' : 'Create' }}
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { groupsAPI, authAPI } from '../services/api'

const emit = defineEmits<{
  'created': []
  'cancel': []
}>()

const groupName = ref('')
const loading = ref(false)
const error = ref('')
const newMemberCode = ref('')
const memberCodes = ref<string[]>([])
const isCreating = ref(false)

const createGroup = async () => {
  if (!groupName.value.trim()) return

  isCreating.value = true
  error.value = ''

  try {
    // Create the group first
    const groupResponse = await groupsAPI.createGroup({
      name: groupName.value.trim()
    })

    // Based on API patterns, the response likely contains 'group_id'
    const groupId = groupResponse.data.group_id || groupResponse.data.id

    if (!groupId) {
      console.error('Group response:', groupResponse.data)
      throw new Error('No group ID returned from API')
    }

    // Get current user profile to get the friend_code
    const userProfile = await authAPI.getProfile()
    
    if (!userProfile.data.friend_code) {
      console.error('User profile:', userProfile.data)
      throw new Error('User friend_code not found')
    }

    // Add current user to the group using their friend code
    try {
      await groupsAPI.addMemberToGroup(groupId, userProfile.data.friend_code)
    } catch (memberError) {
      console.warn('Could not add creator to group:', memberError)
      // Don't fail the whole operation if adding the creator fails
    }

    // Add all specified members to the group
    for (const memberCode of memberCodes.value) {
      try {
        await groupsAPI.addMemberToGroup(groupId, memberCode)
      } catch (memberError) {
        console.warn(`Could not add member ${memberCode}:`, memberError)
        // Continue adding other members even if one fails
      }
    }

    // Reset form
    groupName.value = ''
    memberCodes.value = []
    
    emit('created')
  } catch (err: any) {
    console.error('Error creating group:', err)
    error.value = err.response?.data?.detail || 'Failed to create group'
  } finally {
    isCreating.value = false
  }
}

const cancel = () => {
  emit('cancel')
}

const addMember = () => {
  if (!newMemberCode.value.trim()) return

  memberCodes.value.push(newMemberCode.value)
  newMemberCode.value = ''
}

const removeMember = (index: number) => {
  memberCodes.value.splice(index, 1)
}
</script>

<style scoped>
.create-group-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #fff;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.help-text {
  color: #fff;
  opacity: 0.8;
  font-size: 12px;
  margin-bottom: 8px;
  margin-top: -4px;
}

.group-name-input {
  padding: 12px 16px;
  border: 1px solid #444;
  border-radius: 8px;
  background: #1a1a1a;
  color: white;
  font-size: 16px;
  outline: none;
}

.group-name-input:focus {
  border-color: #666;
}

.group-name-input::placeholder {
  color: #888;
}

.invite-section {
  text-align: center;
}

.invite-text {
  color: #fff;
  opacity: 0.9;
  margin-bottom: 12px;
  font-size: 14px;
}

.invite-code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #444;
}

.invite-code-display span {
  font-family: monospace;
  font-size: 14px;
  color: #fff;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}

.cancel-btn, .submit-btn {
  width: 80px;
  height: 40px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #5a6268, #545b62);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #45a049, #3e8e41);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
}

.member-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.member-input-container input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #1a1a1a;
  color: white;
  font-size: 14px;
}

.member-input-container input:focus {
  outline: none;
  border-color: #4CAF50;
}

.add-member-btn {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.add-member-btn:hover:not(:disabled) {
  background: #45a049;
}

.add-member-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.member-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #444;
}

.member-code {
  font-family: monospace;
  font-size: 14px;
  color: #4CAF50;
  font-weight: 500;
}

.remove-member-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.remove-member-btn:hover {
  background: rgba(255, 107, 107, 0.1);
}

.no-members-warning {
  color: #ff8a80;
  background: rgba(255, 138, 128, 0.1);
  border: 1px solid rgba(255, 138, 128, 0.3);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}
</style>
