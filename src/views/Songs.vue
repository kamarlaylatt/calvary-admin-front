<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Songs</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Manage your song collection</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/songs/new')">
        Add Song
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
      <v-card-title class="d-flex justify-space-between align-center bg-surface">
        <span>All Songs</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search songs..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="max-w-sm"
          :loading="loading"
        ></v-text-field>
      </v-card-title>
      
      <v-table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Song Writer</th>
            <th>Style</th>
            <th>Description</th>
            <th>YouTube</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-8">
              <v-progress-circular indeterminate></v-progress-circular>
              <div class="mt-2">Loading songs...</div>
            </td>
          </tr>
          <tr v-else-if="filteredSongs.length === 0">
            <td colspan="6" class="text-center py-8 text-medium-emphasis">
              {{ search ? 'No songs found matching your search.' : 'No songs available.' }}
            </td>
          </tr>
          <tr v-else v-for="song in filteredSongs" :key="song.id">
            <td class="font-weight-medium">{{ song.title }}</td>
            <td>{{ song.song_writer || '-' }}</td>
            <td>{{ song.style }}</td>
            <td>
              <span class="text-truncate d-inline-block" style="max-width: 200px">
                {{ song.description || '-' }}
              </span>
            </td>
            <td>
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
            </td>
          </tr>
        </tbody>
      </v-table>
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
import { ref, reactive, computed, onMounted, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type Song, type Style } from '@/services/api'

const router = useRouter()
const search = ref('')
const deleteDialog = ref(false)
const selectedSong = ref<Song | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')

const songs = ref<Song[]>([])
const styles = ref<Style[]>([])

// Create computed song list with style names
const songsWithStyles = computed(() => {
  return songs.value.map(song => ({
    ...song,
    style: styles.value.find(style => style.id === song.style_id)?.name || 'Unknown'
  }))
})

const filteredSongs = computed(() => {
  if (!search.value) return songsWithStyles.value
  const searchLower = search.value.toLowerCase()
  return songsWithStyles.value.filter(song => 
    song.title.toLowerCase().includes(searchLower) ||
    song.song_writer?.toLowerCase().includes(searchLower) ||
    song.style.toLowerCase().includes(searchLower) ||
    song.description?.toLowerCase().includes(searchLower)
  )
})

// Watch search input and fetch songs when it changes with debounce
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchSongs(newValue || undefined)
  }, 300)
})

onMounted(() => {
  fetchSongs()
  fetchStyles()
})

async function fetchSongs(searchTerm?: string) {
  loading.value = true
  error.value = ''
  
  try {
    songs.value = await apiService.getSongs(searchTerm)
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
  router.push(`/songs/${song.id}/edit`)
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
    // Remove from local list
    songs.value = songs.value.filter(s => s.id !== selectedSong.value!.id)
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