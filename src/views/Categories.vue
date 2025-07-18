<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Categories</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage your song categories</p>
      </div>
      <v-btn 
        color="primary" 
        prepend-icon="mdi-plus" 
        @click="$router.push('/categories/new')"
        class="flex-shrink-0"
      >
        <span class="d-none d-sm-inline">Add Category</span>
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
        <span class="flex-shrink-0">All Categories</span>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search categories..."
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 300px; min-width: 200px;"
          class="flex-shrink-0"
          :loading="loading"
        ></v-text-field>
      </v-card-title>
      
      <div class="overflow-x-auto">
        <v-table>
          <thead>
            <tr>
              <th>Name</th>
              <th class="d-none d-md-table-cell">Slug</th>
              <th class="d-none d-lg-table-cell">Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="$vuetify.display.lgAndUp ? 4 : $vuetify.display.mdAndUp ? 3 : 2">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="i in 5" :key="i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="25%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="20%" class="d-none d-md-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="35%" class="d-none d-lg-flex"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="20%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td :colspan="$vuetify.display.lgAndUp ? 4 : $vuetify.display.mdAndUp ? 3 : 2" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No categories found matching your search.' : 'No categories available.' }}
              </td>
            </tr>
            <tr v-else v-for="category in categories" :key="category.id">
              <td class="font-weight-medium">
                <div>{{ category.name }}</div>
                <div class="text-caption text-medium-emphasis d-md-none">
                  {{ category.slug }}
                </div>
              </td>
              <td class="d-none d-md-table-cell">
                <code>{{ category.slug }}</code>
              </td>
              <td class="d-none d-lg-table-cell">
                <span class="text-truncate d-inline-block" style="max-width: 300px">
                  {{ category.description || '-' }}
                </span>
              </td>
              <td>
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editCategory(category)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteCategory(category)"
                  ></v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="text-center pa-4" v-if="totalPages > 1">
        <v-pagination
          v-model="page"
          :length="totalPages"
          rounded="circle"
          @update:model-value="fetchCategories"
        ></v-pagination>
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Delete Category</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedCategory?.name }}"? This action cannot be undone.
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
import apiService, { type Category } from '@/services/api'

const router = useRouter()
const search = ref('')
const deleteDialog = ref(false)
const selectedCategory = ref<Category | null>(null)
const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)

const categories = ref<Category[]>([])

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchCategories()
  }, 300)
})

onMounted(() => {
  const pageQuery = router.currentRoute.value.query.page
  if (pageQuery) {
    page.value = parseInt(pageQuery as string)
  }
  fetchCategories()
})

async function fetchCategories() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await apiService.getCategories(page.value, search.value || undefined)
    categories.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load categories. Please try again.'
    console.error('Error fetching categories:', err)
  } finally {
    loading.value = false
  }
}

function editCategory(category: Category) {
  router.push(`/categories/${category.id}/edit?page=${page.value}`)
}

function deleteCategory(category: Category) {
  selectedCategory.value = category
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedCategory.value) return
  
  deleting.value = true
  
  try {
    await apiService.deleteCategory(selectedCategory.value.id)
    fetchCategories() // Refetch categories to update the list
    deleteDialog.value = false
    selectedCategory.value = null
  } catch (err) {
    error.value = 'Failed to delete category. Please try again.'
    console.error('Error deleting category:', err)
  } finally {
    deleting.value = false
  }
}
</script>