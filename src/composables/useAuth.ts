import { ref, computed } from 'vue';
import apiService from '@/services/api';
import type { Role } from '@/services/api';

const isAuthenticated = ref(apiService.isAuthenticated());
const admin = ref<{ name: string; email: string; roles: Role[] }>({
  name: '',
  email: '',
  roles: [],
});

const fetchAdmin = () => {
  const adminDetails = localStorage.getItem('admin_details');
  if (adminDetails) {
    admin.value = JSON.parse(adminDetails);
  }
};

if (isAuthenticated.value) {
  fetchAdmin();
}

export const useAuth = () => {
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiService.login(credentials);
      isAuthenticated.value = true;
      admin.value = response.admin;
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      isAuthenticated.value = false;
      admin.value = { name: '', email: '', roles: [] };
      localStorage.removeItem('admin_details');
      return true;
    } catch (error) {
      isAuthenticated.value = false;
      throw error;
    }
  };

  const checkAuth = () => {
    isAuthenticated.value = apiService.isAuthenticated();
    if (isAuthenticated.value) {
      fetchAdmin();
    }
    return isAuthenticated.value;
  };

  const can = (roleName: string) => {
    return admin.value.roles.some((role) => role.name === roleName);
  };

  const isSuperAdmin = computed(() => {
    return admin.value.roles.some(role => role.id === 1);
  });

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    admin: computed(() => admin.value),
    login,
    logout,
    checkAuth,
    can,
    isSuperAdmin,
  };
};