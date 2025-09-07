<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit Admin' : 'Add New Admin' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update admin details' : 'Create a new admin user' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push({ path: '/admins', query: { page: route.query.page } })">
        Back to Admins
      </v-btn>
    </div>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-card elevation="2">
      <v-card-text>
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate></v-progress-circular>
          <div class="mt-2">Loading admin...</div>
        </div>
        <v-form v-else @submit.prevent="saveAdmin">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="admin.name"
                label="Name"
                variant="outlined"
                required
                :rules="[v => !!v || 'Name is required']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="admin.email"
                label="Email"
                variant="outlined"
                type="email"
                required
                :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row v-if="!isEditing">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="admin.password"
                label="Password"
                variant="outlined"
                type="password"
                required
                :rules="[v => !!v || 'Password is required', v => v.length >= 8 || 'Password must be at least 8 characters']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="admin.password_confirmation"
                label="Confirm Password"
                variant="outlined"
                type="password"
                required
                :rules="[v => !!v || 'Password confirmation is required', v => v === admin.password || 'Passwords must match']"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row v-else>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="admin.password"
                label="New Password (optional)"
                variant="outlined"
                type="password"
                :rules="[v => !v || v.length >= 8 || 'Password must be at least 8 characters']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="admin.password_confirmation"
                label="Confirm New Password"
                variant="outlined"
                type="password"
                :rules="[v => !admin.password || !!v || 'Password confirmation is required', v => !admin.password || v === admin.password || 'Passwords must match']"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="admin.status"
                :items="[
                  { title: 'Active', value: 'active' },
                  { title: 'Inactive', value: 'inactive' }
                ]"
                label="Status"
                variant="outlined"
                required
              ></v-select>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="admin.roles"
                :items="roles"
                item-title="name"
                item-value="id"
                label="Roles"
                variant="outlined"
                multiple
                chips
                clearable
                hint="Select one or more roles for this admin"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>
          
          <v-row class="mt-4">
            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="saving"
              >
                {{ isEditing ? 'Update Admin' : 'Create Admin' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-2"
                @click="$router.push('/admins')"
              >
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiService, { type Role, type CreateAdminRequest, type UpdateAdminRequest } from '@/services/api'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const loading = ref(false)
const error = ref('')
const isEditing = computed(() => !!route.params.id)

const admin = reactive({
  id: null as number | null,
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  status: 'active',
  roles: [] as number[]
})

const roles = ref<Role[]>([])

onMounted(() => {
  fetchRoles()
  if (isEditing.value) {
    loadAdmin()
  }
})

async function fetchRoles() {
  try {
    roles.value = await apiService.getRoles()
  } catch (err) {
    error.value = 'Failed to load roles. Please try again.'
    console.error('Error fetching roles:', err)
  }
}

async function loadAdmin() {
  const adminId = parseInt(route.params.id as string)
  if (isNaN(adminId)) {
    router.push('/admins')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const existingAdmin = await apiService.getAdmin(adminId)
    Object.assign(admin, {
      ...existingAdmin,
      password: '',
      password_confirmation: '',
      roles: existingAdmin.roles?.map(r => r.id) || []
    })
  } catch (err) {
    error.value = 'Failed to load admin. Please try again.'
    console.error('Error loading admin:', err)
  } finally {
    loading.value = false
  }
}

async function saveAdmin() {
  if (!admin.name.trim()) {
    error.value = 'Name is required.'
    return
  }
  
  if (!admin.email.trim()) {
    error.value = 'Email is required.'
    return
  }
  
  if (!isEditing.value) {
    if (!admin.password) {
      error.value = 'Password is required.'
      return
    }
    
    if (admin.password !== admin.password_confirmation) {
      error.value = 'Passwords must match.'
      return
    }
  }
  
  saving.value = true
  error.value = ''
  
  try {
    if (isEditing.value && admin.id) {
      // Update existing admin
      const updateData: UpdateAdminRequest = {
        name: admin.name,
        email: admin.email,
        status: admin.status
      }
      
      // Only include password fields if a new password was provided
      if (admin.password) {
        updateData.password = admin.password
        updateData.password_confirmation = admin.password_confirmation
      }
      
      // Only include roles if they were changed
      if (admin.roles) {
        updateData.roles = admin.roles
      }
      
      await apiService.updateAdmin(admin.id, updateData)
    } else {
      // Create new admin
      const createData: CreateAdminRequest = {
        name: admin.name,
        email: admin.email,
        password: admin.password,
        password_confirmation: admin.password_confirmation,
        status: admin.status,
        roles: admin.roles
      }
      
      await apiService.createAdmin(createData)
    }
    
    router.push({ path: '/admins', query: { page: route.query.page } })
  } catch (err: any) {
    // Handle validation errors from Laravel
    if (err.response && err.response.status === 422) {
      error.value = 'Validation failed. Please check your input.'
    } else {
      error.value = err.message || 'Failed to save admin. Please try again.'
    }
    console.error('Error saving admin:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.v-label {
  display: block;
  margin-bottom: 8px;
}
</style>