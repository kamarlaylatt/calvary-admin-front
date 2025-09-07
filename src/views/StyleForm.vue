<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit Style' : 'Add New Style' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update style details' : 'Create a new style entry' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push('/styles')">
        Back to Styles
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
          <div class="mt-2">Loading style...</div>
        </div>
        <v-form v-else @submit.prevent="saveStyle">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="style.name"
                label="Style Name"
                variant="outlined"
                required
                :rules="[v => !!v || 'Style name is required']"
                placeholder="Enter style name (e.g., Gospel, Contemporary, Traditional)"
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
                {{ isEditing ? 'Update Style' : 'Create Style' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-2"
                @click="$router.push('/styles')"
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

const style = reactive({
  id: null as number | null,
  name: ''
})

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  if (isEditing.value) {
    loadStyle()
  }
})

async function loadStyle() {
  const styleId = parseInt(route.params.id as string)
  if (isNaN(styleId)) {
    router.push('/styles')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const existingStyle = await apiService.getStyle(styleId)
    Object.assign(style, existingStyle)
  } catch (err) {
    error.value = 'Failed to load style. Please try again.'
    console.error('Error loading style:', err)
  } finally {
    loading.value = false
  }
}

async function saveStyle() {
  if (!style.name.trim()) {
    error.value = 'Style name is required.'
    scrollToTop()
    return
  }
  
  saving.value = true
  error.value = ''
  
  try {
    if (isEditing.value && style.id) {
      // Update existing style
      await apiService.updateStyle(style.id, {
        name: style.name.trim()
      })
    } else {
      // Create new style
      await apiService.createStyle({
        name: style.name.trim()
      })
    }
    
    router.push('/styles')
  } catch (err:any) {
    error.value = err.message || 'Failed to save style. Please try again.'
    scrollToTop()
    console.error('Error saving style:', err)
  } finally {
    saving.value = false
  }
}
</script>