<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</h1>
        <p class="text-subtitle-1 text-medium-emphasis">{{ isEditing ? 'Update category details' : 'Create a new category' }}</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push({ path: '/categories', query: { page: route.query.page } })">
        Back to Categories
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
          <div class="mt-2">Loading category...</div>
        </div>
        <v-form v-else @submit.prevent="saveCategory">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="category.name"
                label="Name"
                variant="outlined"
                required
                :rules="[v => !!v || 'Name is required']"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="category.description"
                label="Description"
                variant="outlined"
                rows="3"
                placeholder="Optional description for this category"
              ></v-textarea>
            </v-col>
          </v-row>
         
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="category.sort_no"
                label="Sort Number"
                variant="outlined"
                type="number"
                min="1"
                hint="Controls the display order (lower numbers appear first)"
                persistent-hint
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
                {{ isEditing ? 'Update Category' : 'Create Category' }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="large"
                class="ml-2"
                @click="$router.push('/categories')"
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

const category = reactive({
  id: null as number | null,
  name: '',
  description: '',
  sort_no: 1
})

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  if (isEditing.value) {
    loadCategory()
  }
})

async function loadCategory() {
  const categoryId = parseInt(route.params.id as string)
  if (isNaN(categoryId)) {
    router.push('/categories')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const existingCategory = await apiService.getCategory(categoryId)
    Object.assign(category, existingCategory)
  } catch (err) {
    error.value = 'Failed to load category. Please try again.'
    console.error('Error loading category:', err)
  } finally {
    loading.value = false
  }
}

async function saveCategory() {
  if (!category.name.trim()) {
    error.value = 'Category name is required.'
    scrollToTop()
    return
  }
  
  saving.value = true
  error.value = ''
  
  try {
    if (isEditing.value && category.id) {
      // Update existing category
      await apiService.updateCategory(category.id, {
        name: category.name,
        description: category.description,
        sort_no: category.sort_no
      })
    } else {
      // Create new category
      await apiService.createCategory({
        name: category.name,
        description: category.description,
        sort_no: category.sort_no
      })
    }
    
    router.push({ path: '/categories', query: { page: route.query.page } })
  } catch (err:any) {
    error.value = err.message || 'Failed to save category. Please try again.'
    scrollToTop()
    console.error('Error saving category:', err)
  } finally {
    saving.value = false
  }
}
</script>