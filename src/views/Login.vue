<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-h4 text-center py-8">
            <v-icon class="mr-2">mdi-account-circle</v-icon>
            Admin Login
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                type="email"
                prepend-icon="mdi-email"
                required
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                variant="outlined"
                class="mb-4"
              ></v-text-field>
              
              <v-alert
                v-if="error"
                type="error"
                class="mb-4"
                dismissible
                @click:close="error = ''"
              >
                {{ error }}
              </v-alert>
              
              <v-btn
                type="submit"
                :loading="loading"
                color="primary"
                block
                size="large"
                class="mb-4"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { login } = useAuth();
const form = ref();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
];

const handleLogin = async () => {
  const { valid } = await form.value.validate();
  
  if (!valid) {
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    await login({
      email: email.value,
      password: password.value
    });
    
    router.push('/dashboard');
  } catch (err) {
    error.value = 'Invalid email or password. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>