import { ref, computed } from 'vue';
import apiService from '@/services/api';

const isAuthenticated = ref(apiService.isAuthenticated());

export const useAuth = () => {
  const login = async (credentials: { email: string; password: string }) => {
    try {
      await apiService.login(credentials);
      isAuthenticated.value = true;
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      isAuthenticated.value = false;
      return true;
    } catch (error) {
      isAuthenticated.value = false;
      throw error;
    }
  };

  const checkAuth = () => {
    isAuthenticated.value = apiService.isAuthenticated();
    return isAuthenticated.value;
  };

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    checkAuth
  };
};