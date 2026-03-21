import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../services/api';
import { useRouter } from 'vue-router';
import { useCartStore } from './cart';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const accessToken = ref(null);
  const user = ref(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  const hydrateUserSession = async () => {
    try {
      const cartStore = useCartStore();
      // Eagerly fetch the cart in the background.
      // We don't necessarily need to await it and block the UI from loading,
      // but doing so ensures the cart badge count is correct instantly.
      await cartStore.fetchCart();
    } catch (e) {
      console.error('[AuthStore] Failed to hydrate cart session:', e);
      // We don't fail the login if the cart fails to fetch.
      // The user is still authenticated. The cart store will show its own error state.
    }
  };

  const purgeUserSession = () => {
    const cartStore = useCartStore();
    // We don't call the API to clear the cart in the DB,
    // we just reset the local Pinia state so the next user doesn't see it.
    cartStore.items = [];
    cartStore.cartTotal = 0;
    cartStore.error = null;
  };

  const isAuthReady = ref(false);

  const login = async credentials => {
    try {
      const response = await apiClient.post('/auth/authenticate', credentials);

      accessToken.value = response.data.accessToken;
      user.value = response.data.user;

      await hydrateUserSession();

      return true;
    } catch (error) {
      console.error('Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout sync failed, but proceeding locally');
    } finally {
      accessToken.value = null;
      user.value = null;

      purgeUserSession();
      router.push('/');
    }
  };

  const register = async userData => {
    try {
      const response = await apiClient.post('/auth/register', userData);

      accessToken.value = response.data.accessToken;
      user.value = response.data.user;

      await hydrateUserSession();
      return true;
    } catch (error) {
      console.error('Registration failed');
      throw error;
    }
  };

  const initializeAuth = async () => {
    if (isAuthReady.value) return;

    try {
      const response = await apiClient.post('/auth/refresh');
      accessToken.value = response.data.accessToken;
      user.value = response.data.user;
      await hydrateUserSession();
    } catch (error) {
      accessToken.value = null;
      user.value = null;
      purgeUserSession();
    } finally {
      isAuthReady.value = true;
    }
  };

  const setAccessToken = token => {
    accessToken.value = token;
  };

  return { accessToken, user, isAuthenticated, isAuthReady, setAccessToken, login, logout, initializeAuth, register };
});
