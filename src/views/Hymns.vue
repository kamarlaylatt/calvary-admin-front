<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Hymns</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage hymns</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$router.push('/hymns/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add Hymn</span>
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
              <!-- Hymn Category Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedHymnCategory"
                  :items="hymnCategories"
                  item-title="name"
                  item-value="id"
                  label="Hymn Category"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>

              <!-- Sort By -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="sortBy"
                  :items="sortByOptions"
                  label="Sort By"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-select>
              </v-col>

              <!-- Sort Order -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="sortOrder"
                  :items="sortOrderOptions"
                  label="Sort Order"
                  variant="outlined"
                  density="compact"
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
        <span class="flex-shrink-0">All Hymns</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search hymns by English title..."
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
              <th>No</th>
              <th class="d-none d-md-table-cell">Title</th>
              <th>English Title</th>
              <th class="d-none d-sm-table-cell">Category</th>
              <th class="d-none d-md-table-cell">Reference ID</th>
              <th class="d-none d-lg-table-cell">Song ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.lgAndUp ? 7 : $vuetify.display.mdAndUp ? 6 : $vuetify.display.smAndUp ? 5 : 4">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="12%" class="d-none d-md-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="10%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="hymns.length === 0">
              <td :colspan="$vuetify.display.lgAndUp ? 7 : $vuetify.display.mdAndUp ? 6 : $vuetify.display.smAndUp ? 5 : 4" class="text-center py-8 text-medium-emphasis">
                {{ search || selectedHymnCategory ? 'No hymns found matching your search.' : 'No hymns available.' }}
              </td>
            </tr>
            <tr v-else v-for="hymn in hymns" :key="hymn.id">
              <td class="font-weight-medium">{{ hymn.no }}</td>
              <td class="d-none d-lg-table-cell">
                <span v-if="hymn.song">{{ hymn.song.title }}</span>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td>{{ hymn.english_title || '-' }}</td>
              <td class="d-none d-sm-table-cell">
                <v-chip
                  v-if="hymn.hymn_category"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ hymn.hymn_category.name }}
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td class="d-none d-md-table-cell">{{ hymn.reference_id || '-' }}</td>
              <td class="d-none d-lg-table-cell">
                <v-chip
                  v-if="hymn.song_id"
                  size="small"
                  color="info"
                  variant="tonal"
                >
                  {{ hymn.song_id }}
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              
              <td>
                <div class="d-flex ga-1">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="editHymn(hymn)"
                    title="Edit"
                  ></v-btn>
                  <v-btn
                    v-if="hymn.song_id"
                    icon="mdi-music-note"
                    size="small"
                    variant="text"
                    color="info"
                    @click="goToSong(hymn.song_id)"
                    title="Go to Song"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteHymn(hymn)"
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
          @update:model-value="fetchHymns"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete Hymn</v-card-title>
        <v-card-text>
          Are you sure you want to delete hymn <strong>No. {{ selectedHymn?.no }}</strong>?
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
import apiService, { type Hymn, type HymnCategory } from '@/services/api'

const router = useRouter()

// Data
const hymns = ref<Hymn[]>([])
const hymnCategories = ref<HymnCategory[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const showFilters = ref(true)
const selectedHymnCategory = ref<number | null>(null)
const sortBy = ref<'no' | 'created_at' | 'id' | 'reference_id'>('no')
const sortOrder = ref<'asc' | 'desc'>('asc')
const deleteDialog = ref(false)
const selectedHymn = ref<Hymn | null>(null)
const deleting = ref(false)

// Sort options
const sortByOptions = [
  { title: 'Hymn Number', value: 'no' },
  { title: 'Created Date', value: 'created_at' },
  { title: 'ID', value: 'id' },
  { title: 'Reference ID', value: 'reference_id' }
]

const sortOrderOptions = [
  { title: 'Ascending', value: 'asc' },
  { title: 'Descending', value: 'desc' }
]

// Watchers
watch([page, search, selectedHymnCategory, sortBy, sortOrder], () => {
  fetchHymns()
})

// Lifecycle
onMounted(() => {
  fetchHymnCategories()
  fetchHymns()
})

// Methods
async function fetchHymnCategories() {
  try {
    hymnCategories.value = await apiService.getAllHymnCategories()
  } catch (err) {
    console.error('Error fetching hymn categories:', err)
  }
}

async function fetchHymns() {
  loading.value = true
  error.value = ''

  try {
    const response = await apiService.getHymns(
      page.value,
      undefined,
      undefined,
      search.value || undefined,
      selectedHymnCategory.value || undefined,
      undefined,
      sortBy.value,
      sortOrder.value
    )
    hymns.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load hymns. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching hymns:', err)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  selectedHymnCategory.value = null
  search.value = ''
  sortBy.value = 'no'
  sortOrder.value = 'asc'
}

function editHymn(hymn: Hymn) {
  router.push(`/hymns/${hymn.id}/edit?page=${page.value}`)
}

function goToSong(songId: number) {
  router.push(`/songs/${songId}/edit`)
}

function deleteHymn(hymn: Hymn) {
  selectedHymn.value = hymn
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedHymn.value) return

  deleting.value = true

  try {
    await apiService.deleteHymn(selectedHymn.value.id)
    fetchHymns()
    deleteDialog.value = false
    selectedHymn.value = null
  } catch (err) {
    error.value = 'Failed to delete hymn. Please try again.'
    console.error('Error deleting hymn:', err)
  } finally {
    deleting.value = false
  }
}
</script>
