<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Songs</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage your song collection</p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        @click="$router.push('/songs/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add Song</span>
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
              <!-- ID Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="idFilter"
                  label="ID"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                  min="1"
                ></v-text-field>
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

              <!-- Categories Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedCategoryIds"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Categories"
                  variant="outlined"
                  density="compact"
                  multiple
                  clearable
                  hide-details
                ></v-select>
              </v-col>

              <!-- Languages Filter -->
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="selectedLanguageIds"
                  :items="songLanguages"
                  item-title="name"
                  item-value="id"
                  label="Languages"
                  variant="outlined"
                  density="compact"
                  multiple
                  clearable
                  hide-details
                ></v-select>
              </v-col>

              <!-- Sort Options -->
              <v-col cols="12" sm="6" md="3">
                <div class="d-flex ga-2">
                  <v-select
                    v-model="sortBy"
                    :items="[
                      { title: 'Created Date', value: 'created_at' },
                      { title: 'ID', value: 'id' }
                    ]"
                    label="Sort By"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="flex: 2;"
                  ></v-select>
                  <v-select
                    v-model="sortOrder"
                    :items="[
                      { title: 'Desc', value: 'desc' },
                      { title: 'Asc', value: 'asc' }
                    ]"
                    label="Order"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="flex: 1;"
                  ></v-select>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center bg-surface flex-wrap ga-4">
        <span class="flex-shrink-0">All Songs</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search songs..."
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
              <th>Title</th>
              <th>Style</th>
              <th class="d-none d-lg-table-cell">Categories</th>
              <th class="d-none d-lg-table-cell">Languages</th>
              <th class="d-none d-sm-table-cell">Rating</th>
              <th class="d-none d-sm-table-cell">YouTube</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.lgAndUp ? 8 : $vuetify.display.mdAndUp ? 7 : $vuetify.display.smAndUp ? 6 : 5">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="20%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="15%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="songsWithStyles.length === 0">
              <td :colspan="$vuetify.display.lgAndUp ? 8 : $vuetify.display.mdAndUp ? 7 : $vuetify.display.smAndUp ? 6 : 5" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No songs found matching your search.' : 'No songs available.' }}
              </td>
            </tr>
            <tr v-else v-for="song in songsWithStyles" :key="song.id">
              <td>{{ song.id }}</td>
              <td class="font-weight-medium">
                <div>{{ song.title }}</div>
                <div class="text-caption text-medium-emphasis d-md-none">
                  {{ song.song_writer || 'Unknown writer' }}
                </div>
              </td>
              <td>{{ song.styleName }}</td>
              <td class="d-none d-lg-table-cell">
                <div v-if="song.categories && song.categories.length > 0" class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="category in song.categories"
                    :key="category.id"
                    size="small"
                    color="primary"
                    variant="tonal"
                  >
                    {{ category.name }}
                  </v-chip>
                </div>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td class="d-none d-lg-table-cell">
                <div v-if="song.song_languages && song.song_languages.length > 0" class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="language in song.song_languages"
                    :key="language.id"
                    size="small"
                    color="secondary"
                    variant="tonal"
                    class="language-chip"
                  >
                    {{ language.name }}
                  </v-chip>
                </div>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td class="d-none d-sm-table-cell">
                <div v-if="song.popular_rating" class="d-flex align-center">
                  <v-rating
                    :model-value="song.popular_rating"
                    readonly
                    size="small"
                    density="compact"
                    color="amber"
                  ></v-rating>
                  <span class="text-caption ml-1">({{ song.popular_rating }})</span>
                </div>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td class="d-none d-sm-table-cell">
                <v-btn
                  v-if="song.youtube"
                  icon="mdi-youtube"
                  size="small"
                  variant="text"
                  color="error"
                  :href="song.youtube"
                  target="_blank"
                ></v-btn>
                <span v-else class="text-medium-emphasis">-</span>
              </td>
              <td>
                <div class="d-flex align-center">
                  <v-btn
                    v-if="song.youtube"
                    icon="mdi-youtube"
                    size="small"
                    variant="text"
                    color="error"
                    :href="song.youtube"
                    target="_blank"
                    class="d-sm-none"
                  ></v-btn>
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editSong(song)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteSong(song)"
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
          @update:model-value="fetchSongs"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Song</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedSong?.title }}"? This action cannot be undone.
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type Song, type Style, type Category, type SongLanguage } from '@/services/api'
type SongWithStyleName = Song & { styleName: string; song_languages?: SongLanguage[] }

const router = useRouter()
const search = ref('')
const deleteDialog = ref(false)
const selectedSong = ref<Song | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)

// Filter state variables
const idFilter = ref<string>('')
const selectedStyleId = ref<number | null>(null)
const selectedCategoryIds = ref<number[]>([])
const selectedLanguageIds = ref<number[]>([])
const sortBy = ref<'created_at' | 'id'>('id')
const sortOrder = ref<'asc' | 'desc'>('desc')
const showFilters = ref(false)

const songs = ref<Song[]>([])
const styles = ref<Style[]>([])
const categories = ref<Category[]>([])
const songLanguages = ref<SongLanguage[]>([])

const songsWithStyles = computed<SongWithStyleName[]>(() => {
  return songs.value.map(song => ({
    ...song,
    styleName: styles.value.find(style => style.id === song.style_id)?.name || 'Unknown'
  }))
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchSongs()
  }, 2100)
})

onMounted(() => {
  const pageQuery = router.currentRoute.value.query.page
  if (pageQuery) {
    page.value = parseInt(pageQuery as string)
  }
  fetchSongs()
  fetchStyles()
  fetchCategories()
  fetchSongLanguages()
})

// Watch for filter changes
watch([selectedStyleId, selectedCategoryIds, selectedLanguageIds, sortBy, sortOrder, idFilter], () => {
  page.value = 1
  fetchSongs()
}, { deep: true })

async function fetchSongs() {
  loading.value = true
  error.value = ''
  
  try {
    const parsedId = Number(idFilter.value)
    const idParam = !isNaN(parsedId) && parsedId > 0 ? parsedId : undefined

    const response = await apiService.getSongs(
      page.value,
      search.value || undefined,
      selectedStyleId.value || undefined,
      selectedCategoryIds.value.length > 0 ? selectedCategoryIds.value : undefined,
      selectedLanguageIds.value.length > 0 ? selectedLanguageIds.value : undefined,
      sortBy.value,
      sortOrder.value,
      idParam
    )
    songs.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load songs. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching songs:', err)
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
  selectedStyleId.value = null
  selectedCategoryIds.value = []
  selectedLanguageIds.value = []
  sortBy.value = 'id'
  sortOrder.value = 'desc'
  search.value = ''
  idFilter.value = ''
}

function editSong(song: Song) {
  router.push(`/songs/${song.id}/edit?page=${page.value}`)
}

function deleteSong(song: Song) {
  selectedSong.value = song
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedSong.value) return
  
  deleting.value = true
  
  try {
    await apiService.deleteSong(selectedSong.value.id)
    fetchSongs() // Refetch songs to update the list
    deleteDialog.value = false
    selectedSong.value = null
  } catch (err) {
    error.value = 'Failed to delete song. Please try again.'
    console.error('Error deleting song:', err)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
/* Force white text on Languages chips in dark mode within this component */
:deep(.v-theme--dark .language-chip .v-chip__content) {
  color: #ffffff !important;
}
</style>