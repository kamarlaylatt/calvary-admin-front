<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">App Versions</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage mobile app versions</p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        @click="$router.push('/app-versions/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add App Version</span>
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

    <!-- Filters Section -->
    <v-card class="mb-4" elevation="1">
      <v-card-title class="d-flex justify-space-between align-center py-3">
        <span class="text-h6">Filters</span>
        <div class="d-flex align-center ga-2">
          <v-btn
            variant="text"
            size="small"
            @click="clearFilters"
            prepend-icon="mdi-filter-remove"
          >
            Clear All
          </v-btn>
          <v-btn
            :icon="showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            variant="text"
            size="small"
            @click="showFilters = !showFilters"
          ></v-btn>
        </div>
      </v-card-title>
      
      <v-expand-transition>
        <div v-show="showFilters">
          <v-card-text class="pt-0">
            <v-row>
              <!-- Platform Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedPlatform"
                  :items="platformOptions"
                  label="Platform"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center bg-surface flex-wrap ga-4">
        <span class="flex-shrink-0">All App Versions</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search app versions..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 300px; min-width: 200px;"
          class="flex-shrink-0"
          :loading="loading"
        ></v-text-field>
      </v-card-title>
      
      <div class="overflow-x-auto">
        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Platform</th>
              <th>Version Name</th>
              <th>Version Code</th>
              <th class="d-none d-md-table-cell">Force Update</th>
              <th class="d-none d-lg-table-cell">Release Notes</th>
              <th class="d-none d-lg-table-cell">Update URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.lgAndUp ? 8 : $vuetify.display.mdAndUp ? 7 : $vuetify.display.smAndUp ? 6 : 5">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%" class="d-none d-md-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="15%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="appVersions.length === 0">
              <td :colspan="$vuetify.display.lgAndUp ? 8 : $vuetify.display.mdAndUp ? 7 : $vuetify.display.smAndUp ? 6 : 5" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No app versions found matching your search.' : 'No app versions available.' }}
              </td>
            </tr>
            <tr v-else v-for="appVersion in appVersions" :key="appVersion.id">
              <td>{{ appVersion.id }}</td>
              <td>
                <v-chip
                  :color="appVersion.platform === 'android' ? 'green' : 'blue'"
                  variant="tonal"
                  size="small"
                >
                  {{ appVersion.platform.toUpperCase() }}
                </v-chip>
              </td>
              <td class="font-weight-medium">{{ appVersion.version_name }}</td>
              <td>{{ appVersion.version_code }}</td>
              <td class="d-none d-md-table-cell">
                <v-chip
                  :color="appVersion.is_force_update ? 'red' : 'green'"
                  variant="tonal"
                  size="small"
                >
                  {{ appVersion.is_force_update ? 'Yes' : 'No' }}
                </v-chip>
              </td>
              <td class="d-none d-lg-table-cell text-truncate" style="max-width: 200px;">
                {{ appVersion.release_notes || '-' }}
              </td>
              <td class="d-none d-lg-table-cell text-truncate" style="max-width: 200px;">
                <a :href="appVersion.update_url" target="_blank" class="text-primary text-decoration-none">
                  {{ appVersion.update_url }}
                </a>
              </td>
              <td>
                <div class="d-flex ga-1">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="editAppVersion(appVersion)"
                    title="Edit"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteAppVersion(appVersion)"
                    title="Delete"
                  ></v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Pagination -->
      <v-card-actions v-if="totalPages > 1" class="justify-center py-4">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          rounded="circle"
          @update:model-value="fetchAppVersions"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete App Version</v-card-title>
        <v-card-text>
          Are you sure you want to delete app version <strong>{{ selectedAppVersion?.version_name }}</strong> ({{ selectedAppVersion?.platform.toUpperCase() }})?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            @click="confirmDelete"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type AppVersion } from '@/services/api'

const router = useRouter()

// Data
const appVersions = ref<AppVersion[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const showFilters = ref(true)
const selectedPlatform = ref<'android' | 'ios' | null>(null)
const deleteDialog = ref(false)
const selectedAppVersion = ref<AppVersion | null>(null)
const deleting = ref(false)

// Platform options for filter
const platformOptions = [
  { title: 'Android', value: 'android' },
  { title: 'iOS', value: 'ios' }
]

// Watchers
watch([page, search, selectedPlatform], () => {
  fetchAppVersions()
})

// Lifecycle
onMounted(() => {
  fetchAppVersions()
})

// Methods
async function fetchAppVersions() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.getAppVersions(
      page.value,
      selectedPlatform.value || undefined
    )
    appVersions.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load app versions. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching app versions:', err)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  selectedPlatform.value = null
  search.value = ''
}

function editAppVersion(appVersion: AppVersion) {
  router.push(`/app-versions/${appVersion.id}/edit?page=${page.value}`)
}

function deleteAppVersion(appVersion: AppVersion) {
  selectedAppVersion.value = appVersion
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedAppVersion.value) return
  
  deleting.value = true
  
  try {
    await apiService.deleteAppVersion(selectedAppVersion.value.id)
    fetchAppVersions() // Refetch app versions to update the list
    deleteDialog.value = false
    selectedAppVersion.value = null
  } catch (err) {
    error.value = 'Failed to delete app version. Please try again.'
    console.error('Error deleting app version:', err)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>