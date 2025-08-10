<template>
  <v-container fluid class="pa-6">
    <!-- Dashboard Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Dashboard</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Essential metrics overview</p>
      </div>
    </div>

    <!-- Essential Metrics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div v-if="loading" class="d-flex justify-space-between align-center">
              <div>
                <v-skeleton-loader type="text" width="80" class="mb-1"></v-skeleton-loader>
                <v-skeleton-loader type="heading" width="60"></v-skeleton-loader>
              </div>
              <v-skeleton-loader type="avatar" size="48"></v-skeleton-loader>
            </div>
            <div v-else class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total Songs</p>
                <h3 class="text-h4">{{ songsCount }}</h3>
              </div>
              <v-avatar color="primary" size="48">
                <v-icon>mdi-music-note</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="4">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div v-if="loading" class="d-flex justify-space-between align-center">
              <div>
                <v-skeleton-loader type="text" width="80" class="mb-1"></v-skeleton-loader>
                <v-skeleton-loader type="heading" width="60"></v-skeleton-loader>
              </div>
              <v-skeleton-loader type="avatar" size="48"></v-skeleton-loader>
            </div>
            <div v-else class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total Styles</p>
                <h3 class="text-h4">{{ stylesCount }}</h3>
              </div>
              <v-avatar color="success" size="48">
                <v-icon>mdi-tag</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div v-if="loading" class="d-flex justify-space-between align-center">
              <div>
                <v-skeleton-loader type="text" width="80" class="mb-1"></v-skeleton-loader>
                <v-skeleton-loader type="heading" width="60"></v-skeleton-loader>
              </div>
              <v-skeleton-loader type="avatar" size="48"></v-skeleton-loader>
            </div>
            <div v-else class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total Categories</p>
                <h3 class="text-h4">{{ categoriesCount }}</h3>
              </div>
              <v-avatar color="info" size="48">
                <v-icon>mdi-folder</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Items -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="bg-surface">
            <span>Recent Songs</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-if="loading" class="pa-4">
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
            </div>
            <v-list v-else-if="recentSongs.length > 0">
              <v-list-item
                v-for="song in recentSongs"
                :key="song.id"
                :title="song.title"
                :subtitle="song.styleName || 'No style'"
              >
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-music-note</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4 text-medium-emphasis">
              No songs available
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="bg-surface">
            <span>Recent Styles</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-if="loading" class="pa-4">
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
            </div>
            <v-list v-else-if="recentStyles.length > 0">
              <v-list-item
                v-for="style in recentStyles"
                :key="style.id"
                :title="style.name"
              >
                <template v-slot:prepend>
                  <v-icon color="success">mdi-tag</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4 text-medium-emphasis">
              No styles available
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title class="bg-surface">
            <span>Recent Categories</span>
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-if="loading" class="pa-4">
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
              <v-skeleton-loader type="list-item-two-line" class="mb-2"></v-skeleton-loader>
            </div>
            <v-list v-else-if="recentCategories.length > 0">
              <v-list-item
                v-for="category in recentCategories"
                :key="category.id"
                :title="category.name"
                :subtitle="category.description || 'No description'"
              >
                <template v-slot:prepend>
                  <v-icon color="info">mdi-folder</v-icon>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center pa-4 text-medium-emphasis">
              No categories available
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiService, { type Song, type Style, type Category } from '@/services/api'

const songsCount = ref(0)
const stylesCount = ref(0)
const categoriesCount = ref(0)
const recentSongs = ref<(Song & { styleName?: string })[]>([])
const recentStyles = ref<Style[]>([])
const recentCategories = ref<Category[]>([])
const loading = ref(true)
const stylesMap = ref<Map<number, string>>(new Map())

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  loading.value = true
  try {
    // Load styles first to create mapping
    const stylesData = await apiService.getStyles()
    stylesCount.value = stylesData.length
    recentStyles.value = stylesData.slice(0, 5)
    
    // Create style mapping
    stylesMap.value = new Map(stylesData.map(style => [style.id, style.name]))

    // Load songs count and recent songs
    const songsResponse = await apiService.getSongs(1)
    songsCount.value = songsResponse.total
    recentSongs.value = songsResponse.data.slice(0, 5).map(song => ({
      ...song,
      styleName: typeof song.style_id === 'number' ? stylesMap.value.get(song.style_id) || 'Unknown' : 'Unknown'
    }))

    // Load categories count and recent categories
    const categoriesResponse = await apiService.getCategories(1)
    categoriesCount.value = categoriesResponse.total
    recentCategories.value = categoriesResponse.data.slice(0, 5)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}
</script>