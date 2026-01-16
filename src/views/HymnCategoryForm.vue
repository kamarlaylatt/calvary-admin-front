<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit Hymn Category' : 'Add New Hymn Category' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update hymn category details' : 'Create a new hymn category' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push({ path: '/hymn-categories', query: { page: route.query.page } })">
        Back to Hymn Categories
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
          <div class="mt-2">Loading hymn category...</div>
        </div>
        <v-form v-else @submit.prevent="saveCategory">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="category.name"
                label="Category Name"
                variant="outlined"
                required
                :rules="[v => !!v || 'Category name is required']"
                hint="Enter the name of the hymn category"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-end ga-2">
              <v-btn
                variant="outlined"
                @click="$router.push({ path: '/hymn-categories', query: { page: route.query.page } })"
                :disabled="saving"
              >
                Cancel
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                :loading="saving"
              >
                {{ isEditing ? 'Update' : 'Create' }} Category
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiService, { type CreateHymnCategoryRequest, type UpdateHymnCategoryRequest } from '@/services/api'

const route = useRoute()
const router = useRouter()

// Data
const loading = ref(false)
const saving = ref(false)
const error = ref('')

// Hymn category form data
const category = ref<CreateHymnCategoryRequest>({
  name: ''
})

// Computed
const isEditing = computed(() => route.params.id !== 'new')
const categoryId = computed(() => {
  const id = route.params.id
  return id && id !== 'new' ? parseInt(id as string) : null
})

// Lifecycle
onMounted(() => {
  if (isEditing.value && categoryId.value) {
    fetchCategory(categoryId.value)
  }
})

// Methods
async function fetchCategory(id: number) {
  loading.value = true
  error.value = ''

  try {
    const data = await apiService.getHymnCategory(id)
    category.value = {
      name: data.name
    }
  } catch (err) {
    error.value = 'Failed to load hymn category. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching hymn category:', err)
  } finally {
    loading.value = false
  }
}

async function saveCategory() {
  if (!category.value.name.trim()) {
    error.value = 'Category name is required.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (isEditing.value && categoryId.value) {
      // Update existing category
      const updateData: UpdateHymnCategoryRequest = {
        name: category.value.name
      }
      await apiService.updateHymnCategory(categoryId.value, updateData)
    } else {
      // Create new category
      await apiService.createHymnCategory(category.value)
    }

    // Navigate back to categories list
    router.push({ path: '/hymn-categories', query: { page: route.query.page } })
  } catch (err) {
    error.value = 'Failed to save hymn category. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error saving hymn category:', err)
  } finally {
    saving.value = false
  }
}
</script>
