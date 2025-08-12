<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Song Languages</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage your song languages</p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        @click="$router.push('/song-languages/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add Language</span>
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
        <span class="flex-shrink-0">All Languages</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search languages..."
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
              <td :colspan="$vuetify.display.smAndUp ? 4 : 2">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="30%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-sm-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="15%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredLanguages.length === 0">
              <td :colspan="$vuetify.display.smAndUp ? 4 : 2" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No languages found matching your search.' : 'No languages available.' }}
              </td>
            </tr>
            <tr v-else v-for="language in filteredLanguages" :key="language.id">
              <td class="font-weight-medium">{{ language.name }}</td>
              <td class="d-none d-sm-table-cell">{{ formatDate(language.created_at) }}</td>
              <td class="d-none d-sm-table-cell">{{ formatDate(language.updated_at) }}</td>
              <td>
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editLanguage(language)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteLanguage(language)"
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
        <v-card-title class="text-h5">Delete Language</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedLanguage?.name }}"? This action cannot be undone.
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
import apiService, { type SongLanguage } from '@/services/api'

const router = useRouter()
const search = ref('')
const debouncedSearch = ref('')
const deleteDialog = ref(false)
const selectedLanguage = ref<SongLanguage | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')

const languages = ref<SongLanguage[]>([])

const filteredLanguages = computed(() => {
  if (!debouncedSearch.value) return languages.value
  return languages.value.filter(language =>
    language.name.toLowerCase().includes(debouncedSearch.value.toLowerCase())
  )
})

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 300)
})

onMounted(() => {
  fetchLanguages()
})

async function fetchLanguages() {
  loading.value = true
  error.value = ''
  
  try {
    languages.value = await apiService.getSongLanguages()
  } catch (err) {
    error.value = 'Failed to load languages. Please try again.'
    console.error('Error fetching languages:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function editLanguage(language: SongLanguage) {
  router.push(`/song-languages/${language.id}/edit`)
}

function deleteLanguage(language: SongLanguage) {
  selectedLanguage.value = language
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedLanguage.value) return
  
  deleting.value = true
  
  try {
    await apiService.deleteSongLanguage(selectedLanguage.value.id)
    fetchLanguages() // Refetch languages to update the list
    deleteDialog.value = false
    selectedLanguage.value = null
  } catch (err) {
    error.value = 'Failed to delete language. Please try again.'
    console.error('Error deleting language:', err)
  } finally {
    deleting.value = false
  }
}
</script>
