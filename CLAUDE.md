# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri-based desktop application called "Calvary Admin" that combines:
- **Frontend**: Vue 3 + TypeScript + Vuetify (Material Design components)
- **Backend**: Rust (Tauri framework for desktop app packaging)
- **Build System**: Vite for frontend bundling

The application provides an admin interface with a responsive navigation drawer, dark/light theme toggle, and a basic layout structure for admin functionality.

## Common Commands

### Development
```bash
npm run dev        # Start development server (frontend + Tauri)
npm run tauri      # Run Tauri commands directly
```

### Build & Type Checking
```bash
npm run build      # Type-check with vue-tsc and build for production
npm run preview    # Preview the production build
```

### Tauri-specific
```bash
npm run tauri dev   # Development mode with hot reload
npm run tauri build # Build desktop application for distribution
```

## Architecture

### Frontend Structure
- **src/App.vue**: Main application component with Vuetify layout, navigation drawer, and theme switching
- **src/main.ts**: Vue app initialization with Vuetify setup (Material Design Icons, dark theme default)
- **src/assets/**: Static assets (currently just Vue logo)

### Tauri Backend
- **src-tauri/**: Rust backend code
- **src-tauri/src/main.rs**: Entry point that calls the library function
- **src-tauri/tauri.conf.json**: Tauri configuration (window size, build commands, app metadata)

### Key Technologies
- **Vue 3**: Uses Composition API with `<script setup>` syntax
- **Vuetify 3**: Material Design component library with built-in theming
- **TypeScript**: Strict mode enabled with comprehensive linting rules
- **Vite**: Build tool configured for Tauri development (fixed port 1420)

### Current UI Features
- Responsive navigation drawer with rail mode for smaller screens
- Dark/light theme toggle in app bar
- Basic navigation structure (Home, My Account, Users)
- Vuetify Material Design components throughout

## Development Notes

### Tauri Integration
- Frontend runs on localhost:1420 during development
- Hot module replacement configured for Tauri dev environment
- Build process: `npm run build` → `tauri build` for desktop packaging

### Vue/Vuetify Setup
- Vuetify configured with all components and directives imported
- Material Design Icons (@mdi/font) included for iconography
- Dark theme set as default in main.ts:15

### TypeScript Configuration
- Strict mode enabled with unused variable/parameter detection
- Bundler module resolution for modern development
- Vue SFC support with proper type checking