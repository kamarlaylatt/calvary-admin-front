<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Song Suggestion Details</h1>
        <p class="text-subtitle-1 text-medium-emphasis">View suggestion information</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push({ path: '/suggest-songs', query: { page: route.query.page } })">
        Back to Suggestions
      </v-btn>
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

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate></v-progress-circular>
      <div class="mt-2">Loading suggestion...</div>
    </div>

    <div v-else-if="suggestion">
      <!-- Action Buttons -->
      <v-card class="mb-4" elevation="2">
        <v-card-text class="d-flex ga-2 flex-wrap">
          <v-btn
            v-if="suggestion.status === 1"
            color="success"
            prepend-icon="mdi-check-circle"
            @click="showApproveDialog = true"
            :loading="approving"
            :disabled="approving || cancelling"
          >
            Approve Suggestion
          </v-btn>
          <v-btn
            v-if="suggestion.status === 1"
            color="error"
            prepend-icon="mdi-close-circle"
            @click="showCancelDialog = true"
            :loading="cancelling"
            :disabled="approving || cancelling"
          >
            Cancel Suggestion
          </v-btn>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-pencil"
            @click="$router.push(`/suggest-songs/${suggestion.id}/edit?page=${route.query.page}`)"
          >
            Edit
          </v-btn>
          <v-chip
            :color="getStatusColor(suggestion.status)"
            size="large"
            variant="tonal"
            class="ml-auto"
          >
            {{ getStatusText(suggestion.status) }}
          </v-chip>
        </v-card-text>
      </v-card>

      <!-- Basic Information -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="bg-surface">Basic Information</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">ID</div>
                <div class="text-body-1">{{ suggestion.id }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Code</div>
                <div class="text-body-1">{{ suggestion.code }}</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Title</div>
                <div class="text-h6">{{ suggestion.title }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Song Writer</div>
                <div class="text-body-1">{{ suggestion.song_writer || '-' }}</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Style</div>
                <div class="text-body-1">{{ styleName }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Key</div>
                <div class="text-body-1">{{ suggestion.key || '-' }}</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Categories</div>
                <div v-if="suggestion.categories && suggestion.categories.length" class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="c in suggestion.categories"
                    :key="c.id"
                    size="small"
                    variant="tonal"
                  >{{ c.name }}</v-chip>
                </div>
                <div v-else class="text-body-1">-</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Song Languages</div>
                <div v-if="(suggestion.song_languages || (suggestion as any).songLanguages)?.length" class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="l in (suggestion.song_languages ?? (suggestion as any).songLanguages)"
                    :key="l.id"
                    size="small"
                    variant="tonal"
                  >{{ l.name }}</v-chip>
                </div>
                <div v-else class="text-body-1">-</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Email</div>
                <div class="text-body-1">{{ suggestion.email || '-' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Popular Rating</div>
                <div v-if="suggestion.popular_rating" class="d-flex align-center">
                  <v-rating
                    :model-value="suggestion.popular_rating"
                    readonly
                    size="small"
                    density="compact"
                    color="amber"
                  ></v-rating>
                  <span class="text-caption ml-2">({{ suggestion.popular_rating }})</span>
                </div>
                <div v-else class="text-body-1">-</div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">YouTube URL</div>
                <div class="text-body-1">
                  <a v-if="suggestion.youtube" :href="suggestion.youtube" target="_blank" class="text-primary">
                    {{ suggestion.youtube }}
                    <v-icon size="small" class="ml-1">mdi-open-in-new</v-icon>
                  </a>
                  <span v-else>-</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Description -->
      <v-card v-if="suggestion.description" class="mb-4" elevation="2">
        <v-card-title class="bg-surface">Description</v-card-title>
        <v-card-text>
          <div class="text-body-1 white-space-pre-wrap">{{ suggestion.description }}</div>
        </v-card-text>
      </v-card>

      <!-- Lyrics -->
      <v-card v-if="suggestion.lyrics" class="mb-4" elevation="2">
        <v-card-title class="bg-surface">Lyrics</v-card-title>
        <v-card-text>
          <div class="text-body-1 white-space-pre-wrap">{{ suggestion.lyrics }}</div>
        </v-card-text>
      </v-card>

      <!-- Music Notes -->
      <v-card v-if="suggestion.music_notes" class="mb-4" elevation="2">
        <v-card-title class="bg-surface">Music Notes</v-card-title>
        <v-card-text>
          <div class="text-body-1 white-space-pre-wrap">{{ suggestion.music_notes }}</div>
        </v-card-text>
      </v-card>

      <!-- Timestamps -->
      <v-card elevation="2">
        <v-card-title class="bg-surface">Timestamps</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Created At</div>
                <div class="text-body-1">{{ formatDate(suggestion.created_at) }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Updated At</div>
                <div class="text-body-1">{{ formatDate(suggestion.updated_at) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Approve Confirmation Dialog -->
    <v-dialog v-model="showApproveDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Approve Suggestion</v-card-title>
        <v-card-text>
          Are you sure you want to approve "{{ suggestion?.title }}"? This will create a new song and set the suggestion status to approved.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showApproveDialog = false" :disabled="approving">Cancel</v-btn>
          <v-btn color="success" text @click="approveSuggestion" :loading="approving">Approve</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Cancel Suggestion</v-card-title>
        <v-card-text>
          Are you sure you want to cancel "{{ suggestion?.title }}"? This will set the suggestion status to cancelled.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCancelDialog = false" :disabled="cancelling">No</v-btn>
          <v-btn color="error" text @click="cancelSuggestion" :loading="cancelling">Yes, Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiService, { type SuggestSong, type Style } from '@/services/api'

const route = useRoute()

const suggestion = ref<SuggestSong | null>(null)
const styles = ref<Style[]>([])
const loading = ref(false)
const approving = ref(false)
const cancelling = ref(false)
const error = ref('')
const successMessage = ref('')
const showApproveDialog = ref(false)
const showCancelDialog = ref(false)

const suggestionId = parseInt(route.params.id as string)

const styleName = computed(() => {
  if (!suggestion.value?.style_id) return '-'
  return styles.value.find(s => s.id === suggestion.value?.style_id)?.name || '-'
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(async () => {
  await Promise.all([
    fetchSuggestion(),
    fetchStyles()
  ])
})

async function fetchSuggestion() {
  loading.value = true
  error.value = ''
  
  try {
    suggestion.value = await apiService.getSuggestSong(suggestionId)
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

async function approveSuggestion() {
  if (!suggestion.value) return
  
  approving.value = true
  error.value = ''
  
  try {
    const response = await apiService.approveSuggestSong(suggestion.value.id)
    successMessage.value = response.message + `. Song created with ID ${response.song.id}`
    showApproveDialog.value = false
    
    // Refresh the suggestion to show updated status
    await fetchSuggestion()
  } catch (err) {
    error.value = 'Failed to approve suggestion. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error approving suggestion:', err)
  } finally {
    approving.value = false
  }
}

async function cancelSuggestion() {
  if (!suggestion.value) return
  
  cancelling.value = true
  error.value = ''
  
  try {
    const response = await apiService.cancelSuggestSong(suggestion.value.id)
    successMessage.value = response.message
    showCancelDialog.value = false
    
    // Refresh the suggestion to show updated status
    await fetchSuggestion()
  } catch (err) {
    error.value = 'Failed to cancel suggestion. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error cancelling suggestion:', err)
  } finally {
    cancelling.value = false
  }
}
</script>

<style scoped>
.white-space-pre-wrap {
  white-space: pre-wrap;
}
</style>
