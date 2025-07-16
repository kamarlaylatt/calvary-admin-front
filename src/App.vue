<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTheme, useDisplay } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { mdAndUp } = useDisplay()
const router = useRouter()
const route = useRoute()
const { isAuthenticated, logout } = useAuth()

const drawer = ref(true)
const rail = ref(false)

const theme = useTheme()

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
        title="Admin User"
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
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" value="dashboard" @click="$router.push('/dashboard')"></v-list-item>
        <v-list-item prepend-icon="mdi-music-note" title="Songs" value="songs" @click="$router.push('/songs')"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group-outline" title="Users" value="users"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Settings" value="settings"></v-list-item>
        <v-list-item prepend-icon="mdi-chart-line" title="Analytics" value="analytics"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Profile" value="profile" @click="$router.push('/profile')"></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn
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
