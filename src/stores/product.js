import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '../services/api';

export const useProductStore = defineStore('product', () => {
  const products = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Semantically renamed to reflect the new Creator-Subscriber architecture
  const activeMerchantId = ref('');
  const currentPage = ref(0);
  const totalPages = ref(0);
  const totalElements = ref(0);
  const pageSize = ref(20);

  // 3. Actions
  const fetchProducts = async (merchantId, page = 0) => {
    if (!merchantId || merchantId === 'all') {
      products.value = [];
      totalPages.value = 0;
      totalElements.value = 0;
      return;
    }

    // Prevent duplicate network spam if already loading the exact same request
    if (isLoading.value && activeMerchantId.value === merchantId && currentPage.value === page) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        // We pass the merchantId into the 'categoryId' parameter because that
        // is still what your Spring Boot @RequestParam expects.
        categoryId: merchantId,
        page: page.toString(),
        size: pageSize.value.toString(),
      });

      const response = await apiClient.get(`/products?${params.toString()}`);

      // Map Spring Boot's Page<T> payload correctly
      products.value = response.data.content;
      currentPage.value = response.data.number;
      totalPages.value = response.data.totalPages;
      totalElements.value = response.data.totalElements;

      // Keep store state in sync with the successful request
      activeMerchantId.value = merchantId;
    } catch (err) {
      console.error('[ProductStore] Failed to fetch products:', err);
      error.value = err.response?.data?.message || 'Unable to load the catalog at this time.';
      products.value = []; // Clear dirty state
      totalPages.value = 0;
      totalElements.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  // Helper action to handle UI merchant switching idempotently
  const switchMerchant = async newMerchantId => {
    if (activeMerchantId.value === newMerchantId) return;
    await fetchProducts(newMerchantId, 0); // Always reset to page 0 on merchant change
  };

  return {
    products,
    isLoading,
    error,
    activeMerchantId,
    currentPage,
    totalPages,
    totalElements,
    fetchProducts,
    switchMerchant, // Replaces switchCategory
  };
});
