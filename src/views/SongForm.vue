<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit Song' : 'Add New Song' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update song details' : 'Create a new song entry' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push('/songs')">
        Back to Songs
      </v-btn>
    </div>

    <v-card elevation="2">
      <v-card-text>
        <v-form @submit.prevent="saveSong">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="song.title"
                label="Title"
                variant="outlined"
                required
                :rules="[v => !!v || 'Title is required']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="song.song_writer"
                label="Song Writer"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="song.style_id"
                :items="styles"
                item-title="name"
                item-value="id"
                label="Style"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="song.youtube"
                label="YouTube URL"
                variant="outlined"
                placeholder="https://www.youtube.com/watch?v=..."
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="song.description"
                label="Description"
                variant="outlined"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-label class="text-body-1 font-weight-medium mb-2">Lyrics</v-label>
              <RichTextEditor v-model="song.lyrics" />
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-label class="text-body-1 font-weight-medium mb-2">Music Notes</v-label>
              <RichTextEditor v-model="song.music_notes" />
            </v-col>
          </v-row>
          
          <v-row class="mt-4">
            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="saving"
              >
                {{ isEditing ? 'Update Song' : 'Create Song' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-2"
                @click="$router.push('/songs')"
              >
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RichTextEditor from '../components/RichTextEditor.vue'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const isEditing = computed(() => !!route.params.id)

const song = reactive({
  id: null,
  title: '',
  song_writer: '',
  style_id: null,
  youtube: '',
  description: '',
  lyrics: '',
  music_notes: ''
})

// Sample styles - replace with API call
const styles = ref([
  { id: 1, name: 'Traditional' },
  { id: 2, name: 'Contemporary' },
  { id: 3, name: 'Hymn' },
  { id: 4, name: 'Gospel' },
  { id: 5, name: 'Praise & Worship' },
  { id: 6, name: 'Spiritual' }
])

// Sample songs data for editing - replace with API call
const sampleSongs = [
  {
    id: 1,
    title: 'Amazing Grace',
    song_writer: 'John Newton',
    style_id: 1,
    youtube: 'https://www.youtube.com/watch?v=example1',
    description: 'A beloved hymn about redemption and grace',
    lyrics: '<p>Amazing grace how sweet the sound<br>That saved a wretch like me<br>I once was lost but now am found<br>Was blind but now I see</p>',
    music_notes: '<p><strong>Key:</strong> G major</p><p><strong>Time Signature:</strong> 3/4</p><p><strong>Tempo:</strong> Moderately slow</p>'
  },
  {
    id: 2,
    title: 'How Great Thou Art',
    song_writer: 'Stuart K. Hine',
    style_id: 3,
    youtube: 'https://www.youtube.com/watch?v=example2',
    description: 'A powerful hymn of praise and worship',
    lyrics: '<p>O Lord my God when I in awesome wonder<br>Consider all the works thy hands have made<br>I see the stars, I hear the rolling thunder<br>Thy power throughout the universe displayed</p>',
    music_notes: '<p><strong>Key:</strong> Bb major</p><p><strong>Time Signature:</strong> 4/4</p><p><strong>Tempo:</strong> Moderate</p>'
  },
  {
    id: 3,
    title: 'Great is Thy Faithfulness',
    song_writer: 'Thomas Chisholm',
    style_id: 2,
    youtube: '',
    description: 'A song about God\'s unwavering faithfulness',
    lyrics: '<p>Great is thy faithfulness, O God my father<br>There is no shadow of turning with thee<br>Thou changest not, thy compassions they fail not<br>As thou hast been thou forever wilt be</p>',
    music_notes: '<p><strong>Key:</strong> D major</p><p><strong>Time Signature:</strong> 3/4</p><p><strong>Tempo:</strong> Slow and reverent</p>'
  }
]

onMounted(() => {
  if (isEditing.value) {
    loadSong()
  }
})

function loadSong() {
  const songId = parseInt(route.params.id as string)
  const existingSong = sampleSongs.find(s => s.id === songId)
  
  if (existingSong) {
    Object.assign(song, existingSong)
  }
}

async function saveSong() {
  saving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEditing.value) {
      console.log('Updating song:', song)
      // Update existing song
    } else {
      console.log('Creating new song:', song)
      // Create new song
    }
    
    router.push('/songs')
  } catch (error) {
    console.error('Error saving song:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.v-label {
  display: block;
  margin-bottom: 8px;
}
</style>