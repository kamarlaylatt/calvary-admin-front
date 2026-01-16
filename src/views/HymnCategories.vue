<template>
  <v-container fluid class="pa-6 pa-sm-4 pa-xs-2">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap ga-4">
      <div class="flex-grow-1">
        <h1 class="text-h4 font-weight-bold mb-2">Hymn Categories</h1>
        <p class="text-subtitle-1 text-medium-emphasis d-none d-sm-block">Manage hymn categories</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$router.push('/hymn-categories/new')"
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
        <span>All Hymn Categories</span>
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
              <th>ID</th>
              <th>Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4">
                <div class="d-flex flex-column ga-4 pa-4">
                  <template v-for="_i in 5" :key="_i">
                    <div class="d-flex ga-4">
                      <v-skeleton-loader type="text" width="10%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="40%"></v-skeleton-loader>
                      <v-skeleton-loader type="text" width="30%"></v-skeleton-loader>
                      <v-skeleton-loader type="button" width="15%"></v-skeleton-loader>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-else-if="hymnCategories.length === 0">
              <td colspan="4" class="text-center py-8 text-medium-emphasis">
                {{ search ? 'No hymn categories found matching your search.' : 'No hymn categories available.' }}
              </td>
            </tr>
            <tr v-else v-for="category in hymnCategories" :key="category.id">
              <td>{{ category.id }}</td>
              <td class="font-weight-medium">{{ category.name }}</td>
              <td class="text-medium-emphasis">{{ formatDate(category.created_at) }}</td>
              <td>
                <div class="d-flex ga-1">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="editCategory(category)"
                    title="Edit"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteCategory(category)"
                    title="Delete"
                  ></v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Pagination -->
      <v-card-actions v-if="totalPages > 1" class="justify-center py-4">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          rounded="circle"
          @update:model-value="fetchCategories"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Delete Hymn Category</v-card-title>
        <v-card-text>
          Are you sure you want to delete hymn category <strong>{{ selectedCategory?.name }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            @click="confirmDelete"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type HymnCategory } from '@/services/api'

const router = useRouter()

// Data
const hymnCategories = ref<HymnCategory[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const search = ref('')
const deleteDialog = ref(false)
const selectedCategory = ref<HymnCategory | null>(null)
const deleting = ref(false)

// Watchers
watch([page, search], () => {
  fetchCategories()
})

// Lifecycle
onMounted(() => {
  fetchCategories()
})

// Methods
async function fetchCategories() {
  loading.value = true
  error.value = ''

  try {
    const response = await apiService.getHymnCategories(page.value, search.value)
    hymnCategories.value = response.data
    totalPages.value = response.last_page
  } catch (err) {
    error.value = 'Failed to load hymn categories. ' + (err instanceof Error ? err.message : 'Please try again.')
    console.error('Error fetching hymn categories:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function editCategory(category: HymnCategory) {
  router.push(`/hymn-categories/${category.id}/edit?page=${page.value}`)
}

function deleteCategory(category: HymnCategory) {
  selectedCategory.value = category
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!selectedCategory.value) return

  deleting.value = true

  try {
    await apiService.deleteHymnCategory(selectedCategory.value.id)
    fetchCategories()
    deleteDialog.value = false
    selectedCategory.value = null
  } catch (err) {
    error.value = 'Failed to delete hymn category. Please try again.'
    console.error('Error deleting hymn category:', err)
  } finally {
    deleting.value = false
  }
}
</script>
