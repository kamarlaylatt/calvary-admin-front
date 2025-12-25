import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Songs from '../views/Songs.vue'
import SongForm from '../views/SongForm.vue'
import Styles from '../views/Styles.vue'
import StyleForm from '../views/StyleForm.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Admins from '../views/Admins.vue'
import AdminForm from '../views/AdminForm.vue'
import SuggestSongs from '../views/SuggestSongs.vue'
import SuggestSongForm from '../views/SuggestSongForm.vue'
import apiService from '@/services/api'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/admins',
    name: 'Admins',
    component: Admins,
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/admins/new',
    name: 'AdminNew',
    component: AdminForm,
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/admins/:id/edit',
    name: 'AdminEdit',
    component: AdminForm,
    props: true,
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/songs',
    name: 'Songs',
    component: Songs,
    meta: { requiresAuth: true }
  },
  {
    path: '/songs/new',
    name: 'SongNew',
    component: SongForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/songs/:id/edit',
    name: 'SongEdit',
    component: SongForm,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/styles',
    name: 'Styles',
    component: Styles,
    meta: { requiresAuth: true }
  },
  {
    path: '/styles/new',
    name: 'StyleNew',
    component: StyleForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/styles/:id/edit',
    name: 'StyleEdit',
    component: StyleForm,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/Categories.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/new',
    name: 'CategoryNew',
    component: () => import('../views/CategoryForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:id/edit',
    name: 'CategoryEdit',
    component: () => import('../views/CategoryForm.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/song-languages',
    name: 'SongLanguages',
    component: () => import('../views/SongLanguages.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/song-languages/new',
    name: 'SongLanguageNew',
    component: () => import('../views/SongLanguageForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/song-languages/:id/edit',
    name: 'SongLanguageEdit',
    component: () => import('../views/SongLanguageForm.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/suggest-songs',
    name: 'SuggestSongs',
    component: SuggestSongs,
    meta: { requiresAuth: true }
  },
  {
    path: '/suggest-songs/:id/edit',
    name: 'SuggestSongEdit',
    component: SuggestSongForm,
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = apiService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresSuperAdmin && !apiService.isAdmin()) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router