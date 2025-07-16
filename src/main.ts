import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1976d2',
          secondary: '#424242',
          accent: '#82b1ff',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#fb8c00',
          background: '#fafafa',
          surface: '#ffffff',
          'surface-variant': '#f5f5f5',
          'on-surface': '#1a1a1a',
          'on-surface-variant': '#424242'
        }
      },
      dark: {
        colors: {
          primary: '#2196f3',
          secondary: '#424242',
          accent: '#ff4081',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#fb8c00',
          background: '#121212',
          surface: '#1e1e1e',
          'surface-variant': '#2d2d2d',
          'on-surface': '#ffffff',
          'on-surface-variant': '#e0e0e0'
        }
      }
    }
  }
})

createApp(App).use(router).use(vuetify).mount("#app");
