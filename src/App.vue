<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useTheme, useDisplay } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import apiService from '@/services/api'
import type { AdminProfile } from '@/services/api'

const { mdAndUp } = useDisplay()
const router = useRouter()
const route = useRoute()
const { isAuthenticated, logout, isSuperAdmin } = useAuth()

const drawer = ref(true)
const rail = ref(false)
const profile = ref<AdminProfile | null>(null)

const theme = useTheme()

// Fetch profile data
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      profile.value = await apiService.getAdminDetail()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }
})

// Hide navigation for login page
const showNavigation = computed(() => {
  return route.name !== 'Login' && isAuthenticated.value
})

// Responsive rail behavior
watch(mdAndUp, (newVal) => {
  if (!newVal) {
    rail.value = true
  }
}, { immediate: true })

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

function toggleRail() {
  rail.value = !rail.value
}

function expandFromRail() {
  if (rail.value) {
    rail.value = false
  }
}

function navigateTo(path: string) {
  router.push(path)
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-if="showNavigation"
      v-model="drawer"
      :rail="rail"
      permanent
      @click="expandFromRail"
    >
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="rail ? '' : profile?.name || 'Admin User'"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            @click.stop="toggleRail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" value="dashboard" @click="navigateTo('/dashboard')"></v-list-item>
        <v-list-item v-if="isSuperAdmin" prepend-icon="mdi-account-group" title="Admins" value="admins" @click="navigateTo('/admins')"></v-list-item>
        <v-list-item prepend-icon="mdi-tag" title="Categories" value="categories" @click="navigateTo('/categories')"></v-list-item>
        <v-list-item prepend-icon="mdi-palette" title="Styles" value="styles" @click="navigateTo('/styles')"></v-list-item>
        <v-list-item prepend-icon="mdi-translate" title="Song Languages" value="song-languages" @click="navigateTo('/song-languages')"></v-list-item>
        <v-list-item prepend-icon="mdi-music-note" title="Songs" value="songs" @click="navigateTo('/songs')"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Profile" value="profile" @click="navigateTo('/profile')"></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            v-if="rail"
            @click="handleLogout"
            color="error"
            variant="outlined"
            icon="mdi-logout"
          ></v-btn>
          <v-btn
            v-else
            @click="handleLogout"
            color="error"
            variant="outlined"
            block
            prepend-icon="mdi-logout"
          >
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    
    <v-app-bar v-if="showNavigation">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Calvary Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="toggleTheme" :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'"></v-btn>
    </v-app-bar>
    
    <v-main :class="showNavigation ? 'bg-surface-variant' : ''">
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
/* You can add global styles here if needed */
</style>
