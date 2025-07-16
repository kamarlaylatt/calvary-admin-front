<template>
  <v-container fluid class="pa-6">
    <!-- Dashboard Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">Admin Dashboard</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Welcome back! Here's what's happening with your application.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus">
        New Item
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total Users</p>
                <h3 class="text-h5">1,234</h3>
              </div>
              <v-avatar color="primary" size="48">
                <v-icon>mdi-account-group</v-icon>
              </v-avatar>
            </div>
            <div class="d-flex align-center mt-2">
              <v-icon color="success" size="small">mdi-trending-up</v-icon>
              <span class="text-success text-caption ml-1">+12% from last month</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Active Sessions</p>
                <h3 class="text-h5">892</h3>
              </div>
              <v-avatar color="success" size="48">
                <v-icon>mdi-monitor</v-icon>
              </v-avatar>
            </div>
            <div class="d-flex align-center mt-2">
              <v-icon color="success" size="small">mdi-trending-up</v-icon>
              <span class="text-success text-caption ml-1">+5% from last hour</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Revenue</p>
                <h3 class="text-h5">$12,345</h3>
              </div>
              <v-avatar color="warning" size="48">
                <v-icon>mdi-currency-usd</v-icon>
              </v-avatar>
            </div>
            <div class="d-flex align-center mt-2">
              <v-icon color="error" size="small">mdi-trending-down</v-icon>
              <span class="text-error text-caption ml-1">-3% from last month</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="h-100">
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">System Health</p>
                <h3 class="text-h5">98.5%</h3>
              </div>
              <v-avatar color="info" size="48">
                <v-icon>mdi-heart-pulse</v-icon>
              </v-avatar>
            </div>
            <div class="d-flex align-center mt-2">
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
              <span class="text-success text-caption ml-1">All systems operational</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts and Tables Section -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center bg-surface">
            <span>Recent Activity</span>
            <v-btn variant="text" size="small" color="primary">View All</v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>Login</td>
                  <td>2 minutes ago</td>
                  <td><v-chip color="success" size="small">Success</v-chip></td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>Update Profile</td>
                  <td>5 minutes ago</td>
                  <td><v-chip color="success" size="small">Success</v-chip></td>
                </tr>
                <tr>
                  <td>Bob Johnson</td>
                  <td>Failed Login</td>
                  <td>10 minutes ago</td>
                  <td><v-chip color="error" size="small">Failed</v-chip></td>
                </tr>
                <tr>
                  <td>Alice Wilson</td>
                  <td>Data Export</td>
                  <td>15 minutes ago</td>
                  <td><v-chip color="warning" size="small">Pending</v-chip></td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="bg-surface">Quick Actions</v-card-title>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item prepend-icon="mdi-account-plus" title="Add User" @click="() => {}"></v-list-item>
              <v-list-item prepend-icon="mdi-database-export" title="Export Data" @click="() => {}"></v-list-item>
              <v-list-item prepend-icon="mdi-backup-restore" title="Backup System" @click="() => {}"></v-list-item>
              <v-list-item prepend-icon="mdi-security" title="Security Audit" @click="() => {}"></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        
        <v-card elevation="2">
          <v-card-title class="bg-surface">System Status</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">CPU Usage</span>
                <span class="text-body-2">45%</span>
              </div>
              <v-progress-linear value="45" color="success" height="6"></v-progress-linear>
            </div>
            <div class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">Memory Usage</span>
                <span class="text-body-2">72%</span>
              </div>
              <v-progress-linear value="72" color="warning" height="6"></v-progress-linear>
            </div>
            <div>
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">Storage</span>
                <span class="text-body-2">28%</span>
              </div>
              <v-progress-linear value="28" color="info" height="6"></v-progress-linear>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Dashboard component
</script>