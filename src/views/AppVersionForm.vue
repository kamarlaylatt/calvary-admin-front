<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit App Version' : 'Add New App Version' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update app version details' : 'Create a new app version entry' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push({ path: '/app-versions', query: { page: route.query.page } })">
        Back to App Versions
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
          <div class="mt-2">Loading app version...</div>
        </div>
        <v-form v-else @submit.prevent="saveAppVersion">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="appVersion.platform"
                :items="platformOptions"
                label="Platform"
                variant="outlined"
                required
                :rules="[v => !!v || 'Platform is required']"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="appVersion.version_name"
                label="Version Name"
                variant="outlined"
                required
                :rules="[v => !!v || 'Version name is required']"
                hint="e.g., 1.0.0, 2.1.5"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="appVersion.version_code"
                label="Version Code"
                variant="outlined"
                type="number"
                required
                :rules="[v => !!v || 'Version code is required', v => v > 0 || 'Version code must be positive']"
                hint="Integer version code (e.g., 100 for 1.0.0, 101 for 1.0.1)"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="appVersion.update_url"
                label="Update URL"
                variant="outlined"
                required
                :rules="[v => !!v || 'Update URL is required']"
                hint="Store URL (Google Play Store or App Store)"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="appVersion.release_notes"
                label="Release Notes"
                variant="outlined"
                rows="3"
                auto-grow
                hint="What's new in this version"
                persistent-hint
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="appVersion.is_force_update"
                label="Force Update"
                color="primary"
                hide-details
                hint="Users will be forced to update to this version"
                persistent-hint
              ></v-switch>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-end ga-2">
              <v-btn
                variant="outlined"
                @click="$router.push({ path: '/app-versions', query: { page: route.query.page } })"
                :disabled="saving"
              >
                Cancel
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                :loading="saving"
              >
                {{ isEditing ? 'Update' : 'Create' }} App Version
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiService, { type CreateAppVersionRequest, type UpdateAppVersionRequest } from '@/services/api'

const route = useRoute()
const router = useRouter()

// Data
const loading = ref(false)
const saving = ref(false)
const error = ref('')

// App version form data
const appVersion = ref<CreateAppVersionRequest>({
  platform: 'android',
  version_code: 100,
  version_name: '',
  update_url: '',
  release_notes: '',
  is_force_update: false
})

// Platform options
const platformOptions = [
  { title: 'Android', value: 'android' },
  { title: 'iOS', value: 'ios' }
]

// Computed
const isEditing = computed(() => route.params.id !== 'new')
const appVersionId = computed(() => {
  const id = route.params.id
  return id && id !== 'new' ? parseInt(id as string) : null
})

// Lifecycle
onMounted(() => {
  if (isEditing.value && appVersionId.value) {
    fetchAppVersion(appVersionId.value)
  }
})

// Methods
async function fetchAppVersion(id: number) {
  loading.value = true
  error.value = ''
  
  try {
    const data = await apiService.getAppVersion(id)
    // Convert the response to match our form structure
    appVersion.value = {
      platform: data.platform,
      version_code: data.version_code,
      version_name: data.version_name,
      update_url: data.update_url,
      release_notes: data.release_notes,
      is_force_update: data.is_force_update
    }
  } catch (err) {
    error.value = 'Failed to load app version. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching app version:', err)
  } finally {
    loading.value = false
  }
}

async function saveAppVersion() {
  saving.value = true
  error.value = ''
  
  try {
    if (isEditing.value && appVersionId.value) {
      // Update existing app version
      const updateData: UpdateAppVersionRequest = { ...appVersion.value }
      await apiService.updateAppVersion(appVersionId.value, updateData)
    } else {
      // Create new app version
      await apiService.createAppVersion(appVersion.value)
    }
    
    // Navigate back to app versions list
    router.push({ path: '/app-versions', query: { page: route.query.page } })
  } catch (err) {
    error.value = 'Failed to save app version. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error saving app version:', err)
  } finally {
    saving.value = false
  }
}
</script>