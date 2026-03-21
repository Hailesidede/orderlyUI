<template>
  <div class="tracking-layout">
    <TopNav />

    <main class="tracking-container">
      <!-- HEADER: Dynamic based on view -->
      <div class="page-header">
        <button v-if="currentOrderId" @click="router.push('/tracking')" class="back-btn">
          &larr; Back
        </button>
        <h1>{{ currentOrderId ? 'Track Order' : 'My Deliveries' }}</h1>
      </div>

      <!-- STATE 1: LOADING -->
      <div v-if="isLoading" class="system-state">
        <div class="spinner"></div>
        <p>{{ currentOrderId ? 'Locating your delivery...' : 'Loading your orders...' }}</p>
      </div>

      <!-- STATE 2: ERROR -->
      <div v-else-if="error" class="system-state error">
        <p>{{ error }}</p>
        <button v-if="currentOrderId" @click="router.push('/tracking')" class="btn-primary mt-4">
          View All Orders
        </button>
      </div>

      <!-- STATE 3: THE LIST VIEW (No Order ID in URL) -->
      <div v-else-if="!currentOrderId">
        <div v-if="myOrders.length === 0" class="system-state">
          <p>You have no active orders right now.</p>
          <button @click="router.push('/home')" class="btn-primary mt-4">Start Shopping</button>
        </div>

        <div class="orders-list">
          <div v-for="order in myOrders" :key="order.id" class="order-list-card" @click="handleOrderClick(order)">
            <div class="order-card-header">
              <span class="order-id">Order #{{ order.id.split('-')[0] }}</span>
              <span class="status-badge" :class="order.status.toLowerCase()">
                {{ order.status.replace('_', ' ') }}
              </span>
            </div>
            <div class="order-card-body">
              <p><strong>Total:</strong> {{ order.totalAmount }} KES</p>
              <p><strong>Drop-off:</strong> {{ order.delivery?.targetLocation || 'Pending Assignment' }}</p>
              <p class="date">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </div>
            <div class="order-card-footer">
              <span>Track Delivery &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      <!-- STATE 4: THE TIMELINE VIEW (Order ID is in URL) -->
      <div v-else>
        <div class="eta-card" :class="{ 'bg-red': isCancelled, 'bg-green': isDelivered }">
          <h2>{{ statusHeadline }}</h2>
          <p>Target: {{ delivery.targetLocation }}</p>
        </div>

        <div v-if="delivery.deliveryPin && !isDelivered && !isCancelled" class="pin-card">
          <p class="pin-label">DELIVERY PIN</p>
          <h1 class="pin-code">{{ delivery.deliveryPin }}</h1>
          <p class="pin-instructions">Give this 4-digit code to your runner to receive your order.</p>
        </div>

        <div v-if="delivery.distributorName" class="courier-card">
          <div class="avatar">
            <img
              :src="`https://ui-avatars.com/api/?name=${delivery.distributorName}&background=e5e7eb`"
              alt="Courier"
            />
          </div>
          <div class="courier-info">
            <h4>{{ delivery.distributorName }}</h4>
            <p>Campus Runner</p>
          </div>
          <button class="call-btn" v-if="!isDelivered && !isCancelled">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              ></path>
            </svg>
          </button>
        </div>

        <div class="timeline-container">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="timeline-step"
            :class="{ active: step.id <= activeStep && !isCancelled, cancelled: isCancelled && step.id === activeStep }"
          >
            <div class="indicator-wrapper">
              <div class="indicator">
                <svg
                  v-if="step.id <= activeStep"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path v-if="isCancelled && step.id === activeStep" d="M18 6L6 18M6 6l12 12"></path>
                  <polyline v-else points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div v-if="index < steps.length - 1" class="line"></div>
            </div>
            <div class="step-content">
              <div class="step-header">
                <h4>{{ step.title }}</h4>
              </div>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../services/api';
import TopNav from '../components/TopNav.vue';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const error = ref('');
let pollingInterval = null;

const myOrders = ref([]);

const delivery = ref({});

const currentOrderId = computed(() => route.params.id);

const statusMap = {
  UNASSIGNED: 1,
  CLAIMED: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  CANCELLED: 99,
};

const steps = [
  { id: 1, title: 'Order Paid', desc: 'Finding an available runner.' },
  { id: 2, title: 'Runner Assigned', desc: 'Runner is heading to the pickup point.' },
  { id: 3, title: 'Out for Delivery', desc: 'Runner is heading to your locker.' },
  { id: 4, title: 'Delivered', desc: 'Package dropped off successfully.' },
];

const activeStep = computed(() => statusMap[delivery.value.status] || 1);
const isCancelled = computed(() => delivery.value.status === 'CANCELLED');
const isDelivered = computed(() => delivery.value.status === 'DELIVERED');

const statusHeadline = computed(() => {
  if (isCancelled.value) return 'Order Cancelled';
  if (isDelivered.value) return 'Delivered!';
  if (activeStep.value === 3) return 'Arriving shortly';
  return 'Processing Order';
});

const handleOrderClick = order => {
  if (order.status === 'PENDING') {
    router.push({
      path: '/checkout',
      query: { orderId: order.id, total: order.totalAmount },
    });
  } else {
    router.push(`/tracking/order/${order.id}`);
  }
};
const fetchMyOrders = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await apiClient.get('/orders/me');
    myOrders.value = response.data;
  } catch (err) {
    console.error('Failed to fetch orders', err);
    error.value = 'Could not load your orders. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const fetchTrackingStatus = async () => {
  try {
    const response = await apiClient.get(`/orders/${currentOrderId.value}/track`);
    delivery.value = response.data;
  } catch (err) {
    console.error('Failed to fetch tracking data', err);
    error.value = 'Could not load delivery status. Please check your order ID.';
  } finally {
    isLoading.value = false;
  }
};

const startPolling = () => {
  stopPolling();
  pollingInterval = setInterval(() => {
    if (!isDelivered.value && !isCancelled.value) fetchTrackingStatus();
  }, 10000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const initView = () => {
  isLoading.value = true;
  error.value = '';
  if (currentOrderId.value) {
    fetchTrackingStatus();
    startPolling();
  } else {
    stopPolling();
    fetchMyOrders();
  }
};

watch(currentOrderId, () => {
  initView();
});

onMounted(() => {
  initView();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.system-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.system-state.error {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fef2f2;
}

.bg-red {
  background-color: #ef4444 !important;
  box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.4) !important;
}

.bg-green {
  background-color: #10b981 !important;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4) !important;
}

.timeline-step.cancelled .indicator {
  background: #ef4444;
  border-color: #ef4444;
}

.timeline-step.cancelled .step-header h4 {
  color: #ef4444;
  text-decoration: line-through;
}

.tracking-layout {
  /* min-height: 100vh; */

  background-color: #f8fafc;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 3rem;
}

.tracking-container {
  max-width: 600px;

  margin: 0 auto;

  padding: 2rem;
}

.page-header {
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

.page-header h1 {
  margin: 0;

  font-size: 1.75rem;

  color: var(--text-main);
}

.eta-card {
  background: var(--primary-blue);

  color: white;

  padding: 2rem;

  border-radius: 16px;

  text-align: center;

  margin-bottom: 1.5rem;

  box-shadow: 0 10px 25px -5px rgba(20, 85, 217, 0.4);
}

.eta-card h2 {
  margin: 0 0 0.5rem 0;

  font-size: 1.5rem;
}

.eta-card p {
  margin: 0;

  opacity: 0.9;

  font-size: 0.9rem;
}

.courier-card {
  background: white;

  border: 1px solid var(--border-color);

  border-radius: 16px;

  padding: 1rem 1.5rem;

  display: flex;

  align-items: center;

  gap: 1rem;

  margin-bottom: 2.5rem;
}

.avatar img {
  width: 50px;

  height: 50px;

  border-radius: 50%;

  object-fit: cover;
}

.courier-info {
  flex: 1;
}

.courier-info h4 {
  margin: 0 0 0.2rem 0;

  color: var(--text-main);
}

.courier-info p {
  margin: 0;

  color: var(--text-muted);

  font-size: 0.85rem;
}

.call-btn {
  width: 40px;

  height: 40px;

  border-radius: 50%;

  background: #f0fdf4;

  color: #16a34a;

  border: none;

  display: flex;

  align-items: center;

  justify-content: center;

  cursor: pointer;

  transition: all 0.2s;
}

.call-btn:hover {
  background: #dcfce7;
}

.timeline-container {
  background: white;

  border: 1px solid var(--border-color);

  border-radius: 16px;

  padding: 2rem;
}

.timeline-step {
  display: flex;

  gap: 1.5rem;

  min-height: 80px;
}

.indicator-wrapper {
  display: flex;

  flex-direction: column;

  align-items: center;
}

.indicator {
  width: 24px;

  height: 24px;

  border-radius: 50%;

  background: white;

  border: 2px solid var(--border-color);

  display: flex;

  align-items: center;

  justify-content: center;

  z-index: 2;

  transition: all 0.3s;
}

.indicator svg {
  width: 14px;

  height: 14px;
}

.line {
  width: 2px;

  flex: 1;

  background: var(--border-color);

  margin: 0.2rem 0;

  transition: all 0.3s;
}

.step-content {
  flex: 1;

  padding-bottom: 2rem;
}

.step-header {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 0.25rem;
}

.step-header h4 {
  margin: 0;

  color: var(--text-muted);

  font-size: 1rem;
}

.step-header .time {
  font-size: 0.8rem;

  color: var(--text-muted);
}

.step-content p {
  margin: 0;

  color: var(--text-muted);

  font-size: 0.85rem;
}

.timeline-step.active .indicator {
  background: var(--primary-blue);

  border-color: var(--primary-blue);
}

.timeline-step.active .line {
  background: var(--primary-blue);
}

.timeline-step.active .step-header h4 {
  color: var(--text-main);
}

.mt-4 {
  margin-top: 1rem;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-list-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-list-card:hover {
  border-color: var(--primary-blue);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.order-id {
  font-weight: 700;
  color: var(--text-main);
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef9c3;
  color: #a16207;
}
.status-badge.paid {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-badge.in_transit {
  background: #fef3c7;
  color: #b45309;
}
.status-badge.delivered {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.order-card-body p {
  margin: 0 0 0.4rem 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.order-card-body .date {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

.order-card-footer {
  margin-top: 1rem;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-blue);
}

.pin-card {
  background: white;
  border: 2px dashed var(--primary-blue);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(20, 85, 217, 0.1);
}

.pin-label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-blue);
  letter-spacing: 1px;
}

.pin-code {
  margin: 0.5rem 0;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: 8px;
  color: var(--text-main);
}

.pin-instructions {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>
