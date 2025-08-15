<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Admins</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage admin users</p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        @click="$router.push('/admins/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add Admin</span>
        <span class="d-sm-none">Add</span>
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
      <v-card-title class="d-flex justify-space-between align-center bg-surface flex-wrap ga-4">
        <span>All Admins</span>
      </v-card-title>
      
      <div class="overflow-x-auto">
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th class="d-none d-sm-table-cell">Status</th>
              <th class="d-none d-md-table-cell">Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.mdAndUp ? 6 : $vuetify.display.smAndUp ? 5 : 4">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-md-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="15%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="admins.length === 0">
              <td :colspan="$vuetify.display.mdAndUp ? 6 : $vuetify.display.smAndUp ? 5 : 4" class="text-center py-8 text-medium-emphasis">
                No admins available.
              </td>
            </tr>
            <tr v-else v-for="admin in admins" :key="admin.id">
              <td>{{ admin.id }}</td>
              <td class="font-weight-medium">{{ admin.name }}</td>
              <td>{{ admin.email }}</td>
              <td class="d-none d-sm-table-cell">
                <v-chip
                  :color="admin.status === 'active' ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  {{ admin.status }}
                </v-chip>
              </td>
              <td class="d-none d-md-table-cell">
                <div v-if="admin.roles && admin.roles.length > 0" class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="role in admin.roles"
                    :key="role.id"
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ role.name }}
                  </v-chip>
                </div>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td>
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editAdmin(admin)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteAdmin(admin)"
                    :disabled="admin.id === currentAdmin?.id"
                  ></v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="text-center pa-4" v-if="totalPages > 1">
        <v-pagination
          v-model="page"
          :length="totalPages"
          rounded="circle"
          @update:model-value="fetchAdmins"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Admin</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedAdmin?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false" :disabled="deleting">Cancel</v-btn>
          <v-btn color="error" text @click="confirmDelete" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type Admin } from '@/services/api'

const router = useRouter()
const deleteDialog = ref(false)
const selectedAdmin = ref<Admin | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const currentAdmin = ref<Admin | null>(null)

const admins = ref<Admin[]>([])

onMounted(() => {
  const pageQuery = router.currentRoute.value.query.page
  if (pageQuery) {
    page.value = parseInt(pageQuery as string)
  }
  fetchAdmins()
  fetchCurrentAdmin()
})

async function fetchCurrentAdmin() {
  try {
    const adminProfile = await apiService.getAdminDetail()
    // Convert AdminProfile to Admin by adding the missing status field
    currentAdmin.value = {
      ...adminProfile,
      status: 'active' // Default status, as we don't get this from the profile endpoint
    } as Admin
  } catch (err) {
    console.error('Error fetching current admin:', err)
  }
}

async function fetchAdmins() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.getAdmins(page.value)
    admins.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load admins. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching admins:', err)
  } finally {
    loading.value = false
  }
}

function editAdmin(admin: Admin) {
  router.push(`/admins/${admin.id}/edit?page=${page.value}`)
}

function deleteAdmin(admin: Admin) {
  selectedAdmin.value = admin
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedAdmin.value) return
  
  deleting.value = true
  
  try {
    await apiService.deleteAdmin(selectedAdmin.value.id)
    fetchAdmins() // Refetch admins to update the list
    deleteDialog.value = false
    selectedAdmin.value = null
  } catch (err) {
    error.value = 'Failed to delete admin. Please try again.'
    console.error('Error deleting admin:', err)
  } finally {
    deleting.value = false
  }
}
</script>