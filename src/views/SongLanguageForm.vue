<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit Language' : 'Add New Language' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update language details' : 'Create a new song language' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push('/song-languages')">
        Back to Languages
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
          <div class="mt-2">Loading language...</div>
        </div>
        <v-form v-else @submit.prevent="saveLanguage">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="language.name"
                label="Language Name"
                variant="outlined"
                required
                :rules="[v => !!v || 'Language name is required']"
                placeholder="Enter language name (e.g., English, Spanish, French)"
              ></v-text-field>
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
                {{ isEditing ? 'Update Language' : 'Create Language' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-2"
                @click="$router.push('/song-languages')"
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
import apiService from '@/services/api'

const route = useRoute()
const router = useRouter()

const saving = ref(false)
const loading = ref(false)
const error = ref('')
const isEditing = computed(() => !!route.params.id)

const language = reactive({
  id: null as number | null,
  name: ''
})

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  if (isEditing.value) {
    loadLanguage()
  }
})

async function loadLanguage() {
  const languageId = route.params.id as string
  if (!languageId) {
    router.push('/song-languages')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const existingLanguage = await apiService.getSongLanguage(languageId)
    Object.assign(language, existingLanguage)
  } catch (err) {
    error.value = 'Failed to load language. Please try again.'
    console.error('Error loading language:', err)
  } finally {
    loading.value = false
  }
}

async function saveLanguage() {
  if (!language.name.trim()) {
    error.value = 'Language name is required.'
    scrollToTop()
    return
  }
  
  saving.value = true
  error.value = ''
  
  try {
    if (isEditing.value && route.params.id) {
      // Update existing language
      await apiService.updateSongLanguage(route.params.id as string, {
        name: language.name.trim()
      })
    } else {
      // Create new language
      await apiService.createSongLanguage({
        name: language.name.trim()
      })
    }
    
    router.push('/song-languages')
  } catch (err:any) {
    error.value = err.message || 'Failed to save song language. Please try again.'
    scrollToTop()
    console.error('Error saving language:', err)
  } finally {
    saving.value = false
  }
}
</script>
