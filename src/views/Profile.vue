<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 d-flex align-center">
            <v-icon class="mr-2">mdi-account-circle</v-icon>
            Admin Profile
          </v-card-title>
          
          <v-card-text>
            <v-row v-if="loading">
              <v-col cols="12" class="text-center">
                <v-progress-circular
                  indeterminate
                  size="64"
                  color="primary"
                ></v-progress-circular>
                <p class="mt-4">Loading profile...</p>
              </v-col>
            </v-row>
            
            <v-row v-else-if="error">
              <v-col cols="12">
                <v-alert type="error" class="mb-4">
                  {{ error }}
                </v-alert>
                <v-btn @click="loadProfile" color="primary" variant="outlined">
                  <v-icon class="mr-2">mdi-refresh</v-icon>
                  Try Again
                </v-btn>
              </v-col>
            </v-row>
            
            <v-row v-else-if="profile">
              <v-col cols="12" md="6">
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-h6">Name</v-list-item-title>
                      <v-list-item-subtitle>{{ profile.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon>mdi-account</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-h6">Email</v-list-item-title>
                      <v-list-item-subtitle>{{ profile.email }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon>mdi-email</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-h6">User ID</v-list-item-title>
                      <v-list-item-subtitle>{{ profile.id }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon>mdi-identifier</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-h6">Created</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(profile.created_at) }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon>mdi-calendar</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-h6">Last Updated</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(profile.updated_at) }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon>mdi-update</v-icon>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title>
                    <v-icon class="mr-2">mdi-shield-account</v-icon>
                    Admin Actions
                  </v-card-title>
                  
                  <v-card-text>
                    <v-btn
                      @click="handleLogout"
                      :loading="logoutLoading"
                      color="error"
                      variant="outlined"
                      block
                      class="mb-4"
                    >
                      <v-icon class="mr-2">mdi-logout</v-icon>
                      Logout
                    </v-btn>
                    
                    <v-btn
                      @click="loadProfile"
                      :loading="loading"
                      color="primary"
                      variant="outlined"
                      block
                    >
                      <v-icon class="mr-2">mdi-refresh</v-icon>
                      Refresh Profile
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import apiService from '@/services/api';
import type { AdminProfile } from '@/services/api';

const router = useRouter();
const { logout } = useAuth();
const profile = ref<AdminProfile | null>(null);
const loading = ref(true);
const logoutLoading = ref(false);
const error = ref('');

const loadProfile = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    profile.value = await apiService.getAdminProfile();
  } catch (err) {
    error.value = 'Failed to load profile. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  logoutLoading.value = true;
  
  try {
    await logout();
    router.push('/login');
  } catch (err) {
    error.value = 'Failed to logout. Please try again.';
  } finally {
    logoutLoading.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(() => {
  loadProfile();
});
</script>