<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Song Suggestions</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Review and manage song suggestions</p>
      </div>
    </div>

    <!-- Success Alert -->
    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

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
              <!-- Status Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>

              <!-- Style Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedStyleId"
                  :items="styles"
                  item-title="name"
                  item-value="id"
                  label="Style"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <!-- Category Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedCategoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Category"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <!-- Song Language Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedSongLanguageId"
                  :items="songLanguages"
                  item-title="name"
                  item-value="id"
                  label="Song Language"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <!-- Category Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedCategoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Category"
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
        <span class="flex-shrink-0">All Suggestions</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search by title, lyrics, or code..."
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
              <th>Code</th>
              <th>Title</th>
              <th class="d-none d-md-table-cell">Style</th>
              <th class="d-none d-sm-table-cell">Email</th>
              <th class="d-none d-lg-table-cell">Updated</th>
              <th>Status</th>
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
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-md-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="20%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="suggestionsWithStyles.length === 0">
              <td :colspan="$vuetify.display.lgAndUp ? 8 : $vuetify.display.mdAndUp ? 7 : $vuetify.display.smAndUp ? 6 : 5" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No suggestions found matching your search.' : 'No suggestions available.' }}
              </td>
            </tr>
            <tr v-else v-for="suggestion in suggestionsWithStyles" :key="suggestion.id">
              <td>{{ suggestion.id }}</td>
              <td>{{ suggestion.code }}</td>
              <td class="font-weight-medium">
                <div>{{ suggestion.title }}</div>
                <div class="text-caption text-medium-emphasis d-md-none">
                  {{ suggestion.song_writer || 'Unknown writer' }}
                </div>
              </td>
              <td class="d-none d-md-table-cell">{{ suggestion.styleName }}</td>
              <td class="d-none d-sm-table-cell">
                <span class="text-caption">{{ suggestion.email || '-' }}</span>
              </td>
              <td class="d-none d-lg-table-cell">
                <span class="text-caption">{{ formatDate(suggestion.updated_at) }}</span>
              </td>
              <td>
                <v-chip
                  :color="getStatusColor(suggestion.status)"
                  size="small"
                  variant="tonal"
                >
                  {{ getStatusText(suggestion.status) }}
                </v-chip>
              </td>
              <td>
                <div class="d-flex align-center ga-1">
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="viewSuggestion(suggestion)"
                  >
                    <v-icon>mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">View</v-tooltip>
                  </v-btn>
                  <v-btn
                    v-if="suggestion.status === 1"
                    icon="mdi-check-circle"
                    size="small"
                    variant="text"
                    color="success"
                    @click="approveSuggestion(suggestion)"
                    :loading="approvingId === suggestion.id"
                    :disabled="approvingId !== null || cancellingId !== null"
                  >
                    <v-icon>mdi-check-circle</v-icon>
                    <v-tooltip activator="parent" location="top">Approve</v-tooltip>
                  </v-btn>
                  <v-btn
                    v-if="suggestion.status === 1"
                    icon="mdi-close-circle"
                    size="small"
                    variant="text"
                    color="error"
                    @click="cancelSuggestion(suggestion)"
                    :loading="cancellingId === suggestion.id"
                    :disabled="approvingId !== null || cancellingId !== null"
                  >
                    <v-icon>mdi-close-circle</v-icon>
                    <v-tooltip activator="parent" location="top">Cancel</v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editSuggestion(suggestion)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                  </v-btn>
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
          @update:model-value="fetchSuggestions"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Approve Confirmation Dialog -->
    <v-dialog v-model="approveDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Approve Suggestion</v-card-title>
        <v-card-text>
          Are you sure you want to approve "{{ selectedSuggestion?.title }}"? This will create a new song and set the suggestion status to approved.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="approveDialog = false" :disabled="approvingId !== null">Cancel</v-btn>
          <v-btn color="success" text @click="confirmApprove" :loading="approvingId !== null">Approve</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="cancelDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Cancel Suggestion</v-card-title>
        <v-card-text>
          Are you sure you want to cancel "{{ selectedSuggestion?.title }}"? This will set the suggestion status to cancelled.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cancelDialog = false" :disabled="cancellingId !== null">No</v-btn>
          <v-btn color="error" text @click="confirmCancel" :loading="cancellingId !== null">Yes, Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type SuggestSong, type Style, type Category, type SongLanguage } from '@/services/api'

type SuggestSongWithStyleName = SuggestSong & { styleName: string }

const router = useRouter()
const search = ref('')
const approveDialog = ref(false)
const cancelDialog = ref(false)
const selectedSuggestion = ref<SuggestSong | null>(null)
const loading = ref(false)
const approvingId = ref<number | null>(null)
const cancellingId = ref<number | null>(null)
const error = ref('')
const successMessage = ref('')
const page = ref(1)
const totalPages = ref(1)

// Filter state variables
const selectedStatus = ref<number | null>(1) // Default to pending
const selectedStyleId = ref<number | null>(null)
const selectedCategoryId = ref<number | null>(null)
const selectedSongLanguageId = ref<number | null>(null)
const showFilters = ref(false)

const suggestions = ref<SuggestSong[]>([])
const styles = ref<Style[]>([])
const categories = ref<Category[]>([])
const songLanguages = ref<SongLanguage[]>([])

const statusOptions = [
  { text: 'Pending', value: 1 },
  { text: 'Approved', value: 2 },
  { text: 'Cancelled', value: 0 }
]

const suggestionsWithStyles = computed<SuggestSongWithStyleName[]>(() => {
  return suggestions.value.map(suggestion => ({
    ...suggestion,
    styleName: styles.value.find(style => style.id === suggestion.style_id)?.name || '-'
  }))
})

function getStatusText(status: number): string {
  switch (status) {
    case 0: return 'Cancelled'
    case 1: return 'Pending'
    case 2: return 'Approved'
    default: return 'Unknown'
  }
}

function getStatusColor(status: number): string {
  switch (status) {
    case 0: return 'error'
    case 1: return 'warning'
    case 2: return 'success'
    default: return 'grey'
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchSuggestions()
  }, 2100)
})

onMounted(() => {
  const pageQuery = router.currentRoute.value.query.page
  if (pageQuery) {
    page.value = parseInt(pageQuery as string)
  }
  fetchSuggestions()
  fetchStyles()
  fetchCategories()
  fetchSongLanguages()
})

// Watch for filter changes
watch([selectedStatus, selectedStyleId, selectedCategoryId, selectedSongLanguageId], () => {
  page.value = 1
  fetchSuggestions()
}, { deep: true })

async function fetchSuggestions() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.getSuggestSongs(
      page.value,
      selectedStatus.value !== null ? selectedStatus.value : undefined,
      search.value || undefined,
      selectedStyleId.value || undefined,
      selectedCategoryId.value || undefined,
      selectedSongLanguageId.value || undefined
    )
    suggestions.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load suggestions. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching suggestions:', err)
  } finally {
    loading.value = false
  }
}

async function fetchStyles() {
  try {
    styles.value = await apiService.getStyles()
  } catch (err) {
    console.error('Error fetching styles:', err)
  }
}

async function fetchCategories() {
  try {
    categories.value = await apiService.getAllCategories()
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

async function fetchSongLanguages() {
  try {
    songLanguages.value = await apiService.getSongLanguages()
  } catch (err) {
    console.error('Error fetching song languages:', err)
  }
}

function clearFilters() {
  selectedStatus.value = null
  selectedStyleId.value = null
  selectedCategoryId.value = null
  selectedSongLanguageId.value = null
  search.value = ''
  page.value = 1
  fetchSuggestions()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function editSuggestion(suggestion: SuggestSong) {
  router.push(`/suggest-songs/${suggestion.id}/edit?page=${page.value}`)
}

function viewSuggestion(suggestion: SuggestSong) {
  router.push(`/suggest-songs/${suggestion.id}?page=${page.value}`)
}

function approveSuggestion(suggestion: SuggestSong) {
  selectedSuggestion.value = suggestion
  approveDialog.value = true
}

function cancelSuggestion(suggestion: SuggestSong) {
  selectedSuggestion.value = suggestion
  cancelDialog.value = true
}

async function confirmApprove() {
  if (!selectedSuggestion.value) return
  
  approvingId.value = selectedSuggestion.value.id
  
  try {
    const response = await apiService.approveSuggestSong(selectedSuggestion.value.id)
    successMessage.value = response.message + `. Song created with ID ${response.song.id}`
    fetchSuggestions() // Refetch suggestions to update the list
    approveDialog.value = false
    selectedSuggestion.value = null
  } catch (err) {
    error.value = 'Failed to approve suggestion. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error approving suggestion:', err)
  } finally {
    approvingId.value = null
  }
}

async function confirmCancel() {
  if (!selectedSuggestion.value) return
  
  cancellingId.value = selectedSuggestion.value.id
  
  try {
    const response = await apiService.cancelSuggestSong(selectedSuggestion.value.id)
    successMessage.value = response.message
    fetchSuggestions() // Refetch suggestions to update the list
    cancelDialog.value = false
    selectedSuggestion.value = null
  } catch (err) {
    error.value = 'Failed to cancel suggestion. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error cancelling suggestion:', err)
  } finally {
    cancellingId.value = null
  }
}
</script>

<style scoped>
/* Component-specific styles */
</style>
