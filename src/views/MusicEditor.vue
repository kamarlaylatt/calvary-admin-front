<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Music Editor</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Edit music details</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" @click="$router.push('/songs')">
        Back to Songs
      </v-btn>
    </div>

    <v-card elevation="2">
      <v-card-text>
        <p>Music editor content will go here.</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>