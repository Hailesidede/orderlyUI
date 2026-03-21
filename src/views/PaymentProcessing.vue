<template>
  <div class="processing-layout">
    <div class="processing-card">
      <div v-if="status === 'WAITING'" class="state-container">
        <div class="radar-spinner">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>

        <h2>Awaiting M-Pesa Payment</h2>
        <p class="instruction">
          We've sent a prompt to your phone. <br />
          <strong>Please enter your M-Pesa PIN to complete the order.</strong>
        </p>

        <div class="security-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secure connection established
        </div>
      </div>

      <div v-else-if="status === 'SUCCESS'" class="state-container success">
        <div class="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Payment Received!</h2>
        <p>Your order is confirmed and heading to the ledger.</p>
        <p class="redirect-text">Redirecting you to your receipt...</p>
      </div>

      <div v-else-if="status === 'FAILED'" class="state-container error">
        <div class="icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2>Payment Failed</h2>
        <p class="error-message">{{ errorMessage }}</p>
        <button @click="goBack" class="retry-btn">Return to Checkout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// UI States: WAITING, SUCCESS, FAILED
const status = ref('WAITING');
const errorMessage = ref('');
let eventSource = null;
let timeoutFailsafe = null;
const orderID = ref('');

const goBack = () => {
  router.replace('/checkout');
};

onMounted(() => {
  const checkoutId = route.query.checkoutId;
  orderID.value = route.query.orderId;

  if (!checkoutId) {
    console.warn('[Payment] No checkout ID found, redirecting to safety.');
    goBack();
    return;
  }

  // The brutal truth: Safaricom STK pushes drop silently all the time.
  // We cannot let the user stare at a spinner forever if Daraja fails to send a webhook.
  // Set a hard 60-second failsafe to kill the UI if nothing happens.
  timeoutFailsafe = setTimeout(() => {
    if (status.value === 'WAITING') {
      status.value = 'FAILED';
      errorMessage.value = 'The M-Pesa request timed out. You took too long to enter your PIN or Safaricom is down.';
      closeConnection();
    }
  }, 60000);

  connectSSE(checkoutId);
});

const connectSSE = checkoutId => {
  // NOTE: If you are running Vite, ensure your proxy is set up to route /api to localhost:8080
  eventSource = new EventSource(`/api/v1/payments/stream/${checkoutId}`);

  // Listen for the custom event sent from Spring Boot
  eventSource.addEventListener('PAYMENT_RESULT', event => {
    const data = JSON.parse(event.data);

    if (data.status === 'SUCCESS') {
      status.value = 'SUCCESS';
      closeConnection();

      // Give them 2 seconds to see the green checkmark before routing
      setTimeout(() => {
        router.push({
          path: '/success',
          query: { orderId: orderID.value },
        });
      }, 3000);
    } else {
      status.value = 'FAILED';
      // Pass the direct Daraja error message to the UI
      errorMessage.value = data.message || 'Transaction was cancelled or failed due to insufficient funds.';
      closeConnection();
    }
  });

  // Handle network drops
  eventSource.onerror = err => {
    console.error('[Payment] SSE Connection interrupted:', err);
    // Don't immediately fail the UI on one dropped packet, EventSource auto-reconnects natively.
    // The 60-second timeout failsafe will handle actual permanent drops.
  };
};

const closeConnection = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (timeoutFailsafe) {
    clearTimeout(timeoutFailsafe);
  }
};

onUnmounted(() => {
  // Vital enterprise check: If the user hits the browser "Back" button,
  // we MUST sever the HTTP connection or we leak memory on the backend.
  closeConnection();
});
</script>

<style scoped>
.processing-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 1rem;
}

.processing-card {
  background: white;
  width: 100%;
  max-width: 480px;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 1px solid #e2e8f0;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
}

h2 {
  color: #1e293b;
  margin: 1.5rem 0 0.5rem;
  font-size: 1.5rem;
}

p {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.instruction strong {
  color: #0f172a;
  display: block;
  margin-top: 0.5rem;
}

/* Radar Pulse Animation for Waiting State */
.radar-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-spinner .circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid #1455d9; /* Your primary blue */
  opacity: 0;
  animation: ripple 2s linear infinite;
}

.radar-spinner .circle:nth-child(2) {
  animation-delay: 0.6s;
}

.radar-spinner .circle:nth-child(3) {
  animation-delay: 1.2s;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
  }
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #10b981;
  background: #ecfdf5;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  margin-top: 1rem;
}

/* Success / Error States */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.success .icon-wrapper {
  background: #dcfce7;
  color: #16a34a;
}

.error .icon-wrapper {
  background: #fee2e2;
  color: #dc2626;
}

.error-message {
  color: #dc2626;
  background: #fef2f2;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  width: 100%;
}

.redirect-text {
  font-size: 0.875rem;
  color: #94a3b8;
  animation: pulse 1.5s infinite;
}

.retry-btn {
  width: 100%;
  padding: 1rem;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #0f172a;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
