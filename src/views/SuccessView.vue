<template>
  <div class="success-layout">
    <div class="success-card">
      <div class="success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1>Order Confirmed!</h1>
      <p class="subtitle">Your payment was successful and your order is being processed.</p>

      <div class="order-details">
        <span class="label">Order ID</span>
        <span class="value">{{ orderId }}</span>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="goToTrack">Track Order</button>
        <button class="btn-secondary" @click="router.push('/home')">Return to Home</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const orderId = route.query.orderId;
const goToTrack = () => {
  router.push({
    path: '/tracking',
    query: { orderId: orderId },
  });
};
</script>

<style scoped>
.success-layout {
  min-height: 100vh;
  background-image: url('../assets/success.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.success-card {
  background: white;
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #10b981; /* Success Green */
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
}

.success-icon svg {
  width: 40px;
  height: 40px;
}

h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-main);
  font-size: 1.75rem;
}

.subtitle {
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.order-details {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed var(--border-color);
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.order-details .label {
  color: var(--text-muted);
  font-weight: 500;
}

.order-details .value {
  color: var(--primary-blue);
  font-weight: 700;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: white;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: #f3f4f6;
}
</style>
