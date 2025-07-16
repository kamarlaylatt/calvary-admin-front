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
          <tr v-for="song in filteredSongs" :key="song.id">
            <td class="font-weight-medium">{{ song.title }}</td>
            <td>{{ song.song_writer }}</td>
            <td>{{ song.style }}</td>
            <td>
              <span class="text-truncate d-inline-block" style="max-width: 200px">
                {{ song.description }}
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
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const deleteDialog = ref(false)
const selectedSong = ref<any>(null)

// Sample data - replace with API calls
const songs = reactive([
  {
    id: 1,
    title: 'Amazing Grace',
    song_writer: 'John Newton',
    style: 'Traditional',
    description: 'A beloved hymn about redemption and grace',
    youtube: 'https://www.youtube.com/watch?v=example1',
    lyrics: 'Amazing grace how sweet the sound...',
    music_notes: 'Key of G major, 3/4 time signature'
  },
  {
    id: 2,
    title: 'How Great Thou Art',
    song_writer: 'Stuart K. Hine',
    style: 'Hymn',
    description: 'A powerful hymn of praise and worship',
    youtube: 'https://www.youtube.com/watch?v=example2',
    lyrics: 'O Lord my God when I in awesome wonder...',
    music_notes: 'Key of Bb major, 4/4 time signature'
  },
  {
    id: 3,
    title: 'Great is Thy Faithfulness',
    song_writer: 'Thomas Chisholm',
    style: 'Contemporary',
    description: 'A song about God\'s unwavering faithfulness',
    youtube: '',
    lyrics: 'Great is thy faithfulness, O God my father...',
    music_notes: 'Key of D major, 3/4 time signature'
  }
])

const filteredSongs = computed(() => {
  if (!search.value) return songs
  const searchLower = search.value.toLowerCase()
  return songs.filter(song => 
    song.title.toLowerCase().includes(searchLower) ||
    song.song_writer.toLowerCase().includes(searchLower) ||
    song.style.toLowerCase().includes(searchLower) ||
    song.description.toLowerCase().includes(searchLower)
  )
})

function editSong(song: any) {
  router.push(`/songs/${song.id}/edit`)
}

function deleteSong(song: any) {
  selectedSong.value = song
  deleteDialog.value = true
}

function confirmDelete() {
  if (selectedSong.value) {
    const index = songs.findIndex(s => s.id === selectedSong.value.id)
    if (index > -1) {
      songs.splice(index, 1)
    }
  }
  deleteDialog.value = false
  selectedSong.value = null
}
</script>