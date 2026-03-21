import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../services/api';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const cartTotal = ref(0);

  const isFetching = ref(false);

  const syncingItems = ref(new Set());

  const error = ref(null);

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const isEmpty = computed(() => items.value.length === 0);

  // --- Actions ---

  /**
   * Fetches the true state of the cart from Redis + PostgreSQL
   */
  const fetchCart = async () => {
    isFetching.value = true;
    error.value = null;

    try {
      const response = await apiClient.get('/cart');
      items.value = response.data.items;
      cartTotal.value = response.data.cartTotal;
    } catch (err) {
      console.error('[CartStore] Failed to fetch cart:', err);
      error.value = 'Failed to sync cart with server.';
      items.value = [];
      cartTotal.value = 0;
    } finally {
      isFetching.value = false;
    }
  };

  const addItem = async (productId, quantity = 1) => {
    if (syncingItems.value.has(productId)) return;

    syncingItems.value.add(productId);
    error.value = null;

    try {
      console.log('we are here calling the api');
      await apiClient.post('/cart/items', {
        productId: productId,
        quantity: quantity,
      });

      await fetchCart();
    } catch (err) {
      console.error('[CartStore] Failed to add item:', err);

      const errorMsg = err.response?.data?.message;

      // UX MAGIC: Catch the exact cross-merchant error from Spring Boot
      if (errorMsg && errorMsg.includes('different merchant')) {
        alert(
          'You already have items from another merchant in your cart. Please clear your cart or finish your current order first.'
        );
      } else {
        error.value = errorMsg || 'Could not add item to cart.';
        throw error; // Rethrow so component can handle it
      }
    } finally {
      syncingItems.value.delete(productId);
    }
  };

  /**
   * Removes a specific item from the cart entirely
   */
  const removeItem = async productId => {
    if (syncingItems.value.has(productId)) return;

    syncingItems.value.add(productId);
    error.value = null;

    try {
      await apiClient.delete(`/cart/items/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error('[CartStore] Failed to remove item:', err);
      error.value = 'Could not remove item from cart.';
    } finally {
      syncingItems.value.delete(productId);
    }
  };

  /**
   * Clears the entire cart
   */
  const clearCart = async () => {
    isFetching.value = true;
    try {
      await apiClient.delete('/cart');
      items.value = [];
      cartTotal.value = 0;
    } catch (err) {
      console.error('[CartStore] Failed to clear cart:', err);
      error.value = 'Failed to clear cart.';
    } finally {
      isFetching.value = false;
    }
  };

  const incrementQuantity = async productId => {
    // Re-use addItem since the backend HINCRBY naturally increments
    await addItem(productId, 1);
  };

  const decrementQuantity = async productId => {
    const item = items.value.find(i => i.productId === productId);
    if (!item) return;

    if (item.quantity === 1) {
      // If it's 1, decrementing means removing it completely
      await removeItem(productId);
      return;
    }

    if (syncingItems.value.has(productId)) return;
    syncingItems.value.add(productId);
    error.value = null;

    try {
      // We are now hitting the PUT /items/{productId} endpoint you built!
      await apiClient.put(`/cart/items/${productId}`, {
        quantity: item.quantity - 1,
      });
      await fetchCart();
    } catch (err) {
      console.error('[CartStore] Failed to decrement:', err);
      error.value = 'Could not update quantity.';
    } finally {
      syncingItems.value.delete(productId);
    }
  };

  return {
    // State
    items,
    cartTotal,
    isFetching,
    syncingItems,
    error,
    // Getters
    itemCount,
    isEmpty,
    // Actions
    fetchCart,
    addItem,
    removeItem,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  };
});
