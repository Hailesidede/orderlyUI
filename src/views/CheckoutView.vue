<template>
  <div class="checkout-layout">
    <TopNav />

    <main class="checkout-container">
      <div class="checkout-header">
        <h1>Secure Checkout</h1>
      </div>

      <!-- Handle standard empty cart state ONLY if not recovering an order -->
      <div v-if="isFetching && isEmpty && !isRecoveryMode" class="system-state">
        <div class="spinner"></div>
        <p>Loading your cart...</p>
      </div>

      <div v-else-if="isEmpty && !isRecoveryMode" class="system-state empty">
        <p>Your cart is completely empty.</p>
        <button @click="router.push('/home')" class="place-order-btn mt-4">Browse Items</button>
      </div>

      <div v-else class="checkout-grid">
        <div class="form-section">
          <!-- CART MODE: Show editable items -->
          <div v-if="!isRecoveryMode">
            <h3>Order Items</h3>
            <CheckoutItem
              v-for="item in items"
              :key="item.productId"
              :item="item"
              @increment="handleIncrement"
              @decrement="handleDecrement"
              @remove="handleRemove"
            />
          </div>

          <!-- RECOVERY MODE: Show static order info -->
          <div v-else class="recovery-banner">
            <h3>Pending Order Recovery</h3>
            <p>You are paying for Order #{{ recoveryOrderId.split('-')[0] }}</p>
            <p class="text-muted">Delivery details and items are already saved.</p>
          </div>

          <!-- Hide Delivery Location in Recovery Mode because the DB already has it -->
          <div v-if="!isRecoveryMode" class="card-section">
            <h3>Delivery Details</h3>
            <div class="input-group">
              <label>Dorm / Locker Location</label>
              <input v-model="deliveryDetails.location" type="text" placeholder="e.g., Block A, Locker 42" required />
            </div>
          </div>

          <div class="card-section">
            <h3>Payment</h3>
            <div class="input-group">
              <label>M-Pesa Number (For STK Push)</label>
              <input
                v-model="deliveryDetails.phonePrompt"
                type="tel"
                placeholder="07XX XXX XXX or 2547XX XXX XXX"
                required
              />
            </div>
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-card">
            <h3>Order Summary</h3>

            <div class="summary-row total">
              <span>Total to Pay</span>
              <span>{{ displayTotal }} KES</span>
            </div>

            <p v-if="paymentMessage" class="processing-text">{{ paymentMessage }}</p>

            <button
              class="place-order-btn"
              @click="handlePlaceOrder"
              :disabled="isProcessingPayment || (isEmpty && !isRecoveryMode)"
            >
              <span v-if="isProcessingPayment">Processing...</span>
              <span v-else>Pay {{ displayTotal }} KES via M-Pesa</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../stores/cart';
import apiClient from '../services/api';

import TopNav from '../components/TopNav.vue';
import CheckoutItem from '../components/checkout/CheckoutItem.vue';

const router = useRouter();
const route = useRoute(); // ADDED: To read query parameters
const cartStore = useCartStore();

const { items, cartTotal, isFetching, isEmpty } = storeToRefs(cartStore);

// --- RECOVERY MODE LOGIC ---
const recoveryOrderId = computed(() => route.query.orderId);
const recoveryTotal = computed(() => route.query.total);
const isRecoveryMode = computed(() => !!recoveryOrderId.value);

// Compute the final total strictly for UI display
const displayTotal = computed(() => {
  if (isRecoveryMode.value) return Number(recoveryTotal.value);
  if (isEmpty.value) return 0;
  return cartTotal.value;
});

// Delivery Form State
const deliveryDetails = ref({
  location: '',
  phonePrompt: '',
  timeSlot: 'ASAP',
});

const isProcessingPayment = ref(false);
const paymentMessage = ref('');

onMounted(() => {
  // Only fetch the cart if we are NOT recovering an existing order
  if (!isRecoveryMode.value && isEmpty.value) {
    cartStore.fetchCart();
  }
});

const handleIncrement = productId => cartStore.incrementQuantity(productId);
const handleDecrement = productId => cartStore.decrementQuantity(productId);
const handleRemove = productId => cartStore.removeItem(productId);

const handlePlaceOrder = async () => {
  if (!isRecoveryMode.value && isEmpty.value) {
    alert('Your cart is empty.');
    return;
  }

  // If new order, require location. If recovery, only require phone.
  if (!isRecoveryMode.value && !deliveryDetails.value.location) {
    alert('Please fill in your exact dorm location.');
    return;
  }

  if (!deliveryDetails.value.phonePrompt) {
    alert('Please provide your M-Pesa number.');
    return;
  }

  let formattedPhone = deliveryDetails.value.phonePrompt.trim();
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.substring(1);
  }

  try {
    isProcessingPayment.value = true;
    let targetOrderId = recoveryOrderId.value;

    // STEP 1: Create the Order (ONLY IF NOT IN RECOVERY MODE)
    if (!isRecoveryMode.value) {
      paymentMessage.value = 'Creating order...';
      const orderItems = items.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const orderResponse = await apiClient.post('/orders', {
        deliveryLocation: deliveryDetails.value.location,
        deliveryTimeSlot: deliveryDetails.value.timeSlot,
        items: orderItems,
      });

      targetOrderId = orderResponse.data.orderId;
    }

    // STEP 2: Initiate STK Push (Always happens)
    paymentMessage.value = 'Sending M-Pesa prompt to your phone...';
    const stkResponse = await apiClient.post('/payments/stk-push', {
      orderId: targetOrderId,
      phoneNumber: formattedPhone,
    });

    if (stkResponse.data.checkoutRequestId) {
      paymentMessage.value = 'Please enter your M-Pesa PIN.';

      // Clear the cart on successful STK push initiation
      if (!isRecoveryMode.value) {
        await cartStore.clearCart();
      }

      router.push({
        path: '/payment-processing',
        query: { checkoutId: stkResponse.data.checkoutRequestId, orderId: targetOrderId },
      });
    }
  } catch (error) {
    console.error('Checkout failed:', error);
    alert(error.response?.data?.message || 'Payment initiation failed. Please try again.');
  } finally {
    isProcessingPayment.value = false;
    paymentMessage.value = '';
  }
};
</script>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
.system-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}
.checkout-layout {
  /* min-height: 100vh; */
  background-color: #f8fafc;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 3rem;
}

.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 5rem;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
}

.back-btn:hover {
  color: var(--text-main);
}

.checkout-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--text-main);
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.card-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  margin-top: 1.5rem;
}

.card-section h3,
.form-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: var(--text-main);
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(20, 85, 217, 0.1);
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  position: sticky;
  top: 100px;
}

.summary-card h3 {
  margin: 0 0 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--text-muted);
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 1.5rem 0;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 2rem;
}

.place-order-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary-blue);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.place-order-btn:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

.recovery-banner {
  background: #f0fdf4;
  border: 1px solid #16a34a;
  padding: 1.5rem;
  border-radius: 16px;
  color: #166534;
}

.recovery-banner h3 {
  margin: 0 0 0.5rem 0;
  color: #16a34a;
}

.text-muted {
  color: #475569;
  font-size: 0.9rem;
  margin: 0;
}
</style>
