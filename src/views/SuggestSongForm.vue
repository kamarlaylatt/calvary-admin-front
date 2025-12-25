<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Edit Song Suggestion</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Update suggestion details</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push({ path: '/suggest-songs', query: { page: route.query.page } })">
        Back to Suggestions
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
          <div class="mt-2">Loading suggestion...</div>
        </div>
        <v-form v-else @submit.prevent="saveSuggestion">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="suggestion.code"
                label="Code"
                variant="outlined"
                type="number"
                required
                :rules="[v => !!v || 'Code is required']"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="suggestion.title"
                label="Title"
                variant="outlined"
                required
                :rules="[v => !!v || 'Title is required']"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="suggestion.song_writer"
                label="Song Writer"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="suggestion.style_id"
                :items="styles"
                item-title="name"
                item-value="id"
                label="Style"
                variant="outlined"
                clearable
                :hint="'Optional'"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="suggestion.youtube"
                label="YouTube URL"
                variant="outlined"
                placeholder="https://www.youtube.com/watch?v=..."
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="suggestion.key"
                label="Key"
                variant="outlined"
                placeholder="C, D, Em, etc."
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedCategoryIds"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Categories"
                variant="outlined"
                multiple
                chips
                clearable
                hint="Associate one or more categories"
                persistent-hint
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedSongLanguageIds"
                :items="songLanguages"
                item-title="name"
                item-value="id"
                label="Song Languages"
                variant="outlined"
                multiple
                chips
                clearable
                hint="Associate one or more song languages"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="suggestion.email"
                label="Email"
                variant="outlined"
                type="email"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model.number="suggestion.popular_rating"
                :items="[0, 1, 2, 3, 4, 5]"
                label="Popular Rating"
                variant="outlined"
                clearable
              ></v-select>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="suggestion.description"
                label="Description"
                variant="outlined"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="suggestion.lyrics"
                label="Lyrics"
                variant="outlined"
                rows="8"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="suggestion.music_notes"
                label="Music Notes"
                variant="outlined"
                rows="5"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-end ga-2">
              <v-btn 
                variant="outlined" 
                @click="$router.push({ path: '/suggest-songs', query: { page: route.query.page } })"
                :disabled="saving"
              >
                Cancel
              </v-btn>
              <v-btn 
                type="submit" 
                color="primary"
                :loading="saving"
              >
                Save Changes
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiService, { type Style, type UpdateSuggestSongRequest, type Category, type SongLanguage } from '@/services/api'

const router = useRouter()
const route = useRoute()

const suggestion = ref<UpdateSuggestSongRequest & { code?: number; title?: string }>({
  code: undefined,
  title: '',
  youtube: '',
  description: '',
  song_writer: '',
  style_id: undefined,
  key: '',
  lyrics: '',
  music_notes: '',
  popular_rating: undefined,
  email: ''
})

const styles = ref<Style[]>([])
const categories = ref<Category[]>([])
const songLanguages = ref<SongLanguage[]>([])
const selectedCategoryIds = ref<number[]>([])
const selectedSongLanguageIds = ref<number[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const suggestionId = parseInt(route.params.id as string)

onMounted(async () => {
  await Promise.all([
    fetchSuggestion(),
    fetchStyles(),
    fetchCategories(),
    fetchSongLanguages()
  ])
})

async function fetchSuggestion() {
  loading.value = true
  error.value = ''
  
  try {
    const data = await apiService.getSuggestSong(suggestionId)
    suggestion.value = {
      code: data.code,
      title: data.title,
      youtube: data.youtube || '',
      description: data.description || '',
      song_writer: data.song_writer || '',
      style_id: data.style_id || undefined,
      key: data.key || '',
      lyrics: data.lyrics || '',
      music_notes: data.music_notes || '',
      popular_rating: data.popular_rating,
      email: data.email || ''
    }
    if (data.categories && Array.isArray(data.categories)) {
      selectedCategoryIds.value = data.categories.map(c => c.id)
    }
    const languages = (data.song_languages ?? (data as any).songLanguages) as SongLanguage[] | undefined
    if (languages && Array.isArray(languages)) {
      selectedSongLanguageIds.value = languages.map(l => l.id)
    }
  } catch (err) {
    error.value = 'Failed to load suggestion. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching suggestion:', err)
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

async function saveSuggestion() {
  saving.value = true
  error.value = ''
  
  try {
    const updateData: UpdateSuggestSongRequest = {}
    
    if (suggestion.value.code !== undefined) updateData.code = suggestion.value.code
    if (suggestion.value.title) updateData.title = suggestion.value.title
    if (suggestion.value.youtube) updateData.youtube = suggestion.value.youtube
    if (suggestion.value.description) updateData.description = suggestion.value.description
    if (suggestion.value.song_writer) updateData.song_writer = suggestion.value.song_writer
    if (suggestion.value.style_id !== undefined) updateData.style_id = suggestion.value.style_id
    if (suggestion.value.key) updateData.key = suggestion.value.key
    if (suggestion.value.lyrics) updateData.lyrics = suggestion.value.lyrics
    if (suggestion.value.music_notes) updateData.music_notes = suggestion.value.music_notes
    if (suggestion.value.popular_rating !== undefined) updateData.popular_rating = suggestion.value.popular_rating
    if (suggestion.value.email) updateData.email = suggestion.value.email
    if (selectedCategoryIds.value && selectedCategoryIds.value.length > 0) updateData.category_ids = selectedCategoryIds.value
    if (selectedSongLanguageIds.value && selectedSongLanguageIds.value.length > 0) updateData.song_language_ids = selectedSongLanguageIds.value
    
    await apiService.updateSuggestSong(suggestionId, updateData)
    router.push({ path: '/suggest-songs', query: { page: route.query.page } })
  } catch (err) {
    error.value = 'Failed to save suggestion. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error saving suggestion:', err)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Component-specific styles */
</style>
