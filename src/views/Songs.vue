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
              <th>Title</th>
              <th class="d-none d-md-table-cell">Song Writer</th>
              <th>Style</th>
              <th class="d-none d-lg-table-cell">Categories</th>
              <th class="d-none d-lg-table-cell">Description</th>
              <th class="d-none d-sm-table-cell">YouTube</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.lgAndUp ? 7 : $vuetify.display.mdAndUp ? 6 : $vuetify.display.smAndUp ? 5 : 4">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="20%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-md-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="15%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="10%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="15%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="songsWithStyles.length === 0">
              <td :colspan="$vuetify.display.lgAndUp ? 7 : $vuetify.display.mdAndUp ? 6 : $vuetify.display.smAndUp ? 5 : 4" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No songs found matching your search.' : 'No songs available.' }}
              </td>
            </tr>
            <tr v-else v-for="song in songsWithStyles" :key="song.id">
              <td class="font-weight-medium">
                <div>{{ song.title }}</div>
                <div class="text-caption text-medium-emphasis d-md-none">
                  {{ song.song_writer || 'Unknown writer' }}
                </div>
              </td>
              <td class="d-none d-md-table-cell">{{ song.song_writer || '-' }}</td>
              <td>{{ song.style }}</td>
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
                <span class="text-truncate d-inline-block" style="max-width: 200px">
                  {{ song.description || '-' }}
                </span>
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
import apiService, { type Song, type Style } from '@/services/api'

const router = useRouter()
const search = ref('')
const deleteDialog = ref(false)
const selectedSong = ref<Song | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)

const songs = ref<Song[]>([])
const styles = ref<Style[]>([])

const songsWithStyles = computed(() => {
  return songs.value.map(song => ({
    ...song,
    style: styles.value.find(style => style.id === song.style_id)?.name || 'Unknown'
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
})

async function fetchSongs() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.getSongs(page.value, search.value || undefined)
    songs.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load songs. Please try again.'
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