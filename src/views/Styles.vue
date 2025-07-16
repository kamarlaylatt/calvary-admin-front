<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Styles</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage your music styles</p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        @click="$router.push('/styles/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add Style</span>
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
        <span class="flex-shrink-0">All Styles</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search styles..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 300px; min-width: 200px;"
          class="flex-shrink-0"
        ></v-text-field>
      </v-card-title>
      
      <div class="overflow-x-auto">
        <v-table>
          <thead>
            <tr>
              <th>Name</th>
              <th class="d-none d-sm-table-cell">Created</th>
              <th class="d-none d-sm-table-cell">Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.smAndUp ? 4 : 2" class="text-center py-8">
                <v-progress-circular indeterminate></v-progress-circular>
                <div class="mt-2">Loading styles...</div>
              </td>
            </tr>
            <tr v-else-if="filteredStyles.length === 0">
              <td :colspan="$vuetify.display.smAndUp ? 4 : 2" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No styles found matching your search.' : 'No styles available.' }}
              </td>
            </tr>
            <tr v-else v-for="style in filteredStyles" :key="style.id">
              <td class="font-weight-medium">{{ style.name }}</td>
              <td class="d-none d-sm-table-cell">{{ formatDate(style.created_at) }}</td>
              <td class="d-none d-sm-table-cell">{{ formatDate(style.updated_at) }}</td>
              <td>
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editStyle(style)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteStyle(style)"
                  ></v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Style</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedStyle?.name }}"? This action cannot be undone.
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type Style } from '@/services/api'

const router = useRouter()
const search = ref('')
const deleteDialog = ref(false)
const selectedStyle = ref<Style | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')

const styles = ref<Style[]>([])

const filteredStyles = computed(() => {
  if (!search.value) return styles.value
  return styles.value.filter(style => 
    style.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(() => {
  fetchStyles()
})

async function fetchStyles() {
  loading.value = true
  error.value = ''
  
  try {
    styles.value = await apiService.getStyles()
  } catch (err) {
    error.value = 'Failed to load styles. Please try again.'
    console.error('Error fetching styles:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function editStyle(style: Style) {
  router.push(`/styles/${style.id}/edit`)
}

function deleteStyle(style: Style) {
  selectedStyle.value = style
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedStyle.value) return
  
  deleting.value = true
  
  try {
    await apiService.deleteStyle(selectedStyle.value.id)
    fetchStyles() // Refetch styles to update the list
    deleteDialog.value = false
    selectedStyle.value = null
  } catch (err) {
    error.value = 'Failed to delete style. Please try again.'
    console.error('Error deleting style:', err)
  } finally {
    deleting.value = false
  }
}
</script>