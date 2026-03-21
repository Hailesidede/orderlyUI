<template>
  <div class="driver-layout">
    <header class="driver-header">
      <div class="header-content">
        <h1>Runner Hub</h1>
        <div class="status-badge" :class="{ online: isPolling }">
          {{ isPolling ? 'Looking for jobs...' : 'Offline' }}
        </div>
      </div>
    </header>

    <main class="dashboard-container">
      <!-- Navigation Tabs -->
      <div class="tabs">
        <button :class="{ active: activeTab === 'dispatch' }" @click="activeTab = 'dispatch'">
          Dispatch
        </button>
        <button :class="{ active: activeTab === 'earnings' }" @click="activeTab = 'earnings'">
          Earnings
        </button>
      </div>

      <!-- DISPATCH TAB -->
      <section v-if="activeTab === 'dispatch'" class="tab-content">
        <section v-if="myDeliveries.length > 0" class="active-jobs">
          <h2>My Current Runs</h2>

          <div v-for="job in myDeliveries" :key="job.id" class="job-card active-card">
            <div class="job-header">
              <span class="order-id">Job #{{ job.deliveryId.split('-')[0] }}</span>
              <span class="status-tag" :class="job.status.toLowerCase()">{{ job.status.replace('_', ' ') }}</span>
            </div>

            <div class="job-details">
              <p><strong>Drop-off:</strong> {{ job.targetLocation }}</p>
              <p><strong>Time:</strong> {{ job.timeSlot }}</p>
            </div>

            <div class="action-buttons">
              <button
                v-if="job.status === 'CLAIMED'"
                @click="updateStatus(job.deliveryId, 'IN_TRANSIT')"
                class="btn-primary"
                :disabled="isProcessing"
              >
                Start Delivery
              </button>

              <button
                v-if="job.status === 'IN_TRANSIT'"
                @click="promptForPin(job.deliveryId, 'DELIVERED')"
                class="btn-success"
                :disabled="isProcessing"
              >
                Mark as Delivered (Get Paid)
              </button>
            </div>
          </div>
        </section>

        <hr v-if="myDeliveries.length > 0 && availableJobs.length > 0" class="divider" />

        <section class="available-jobs">
          <h2>Available Pickups</h2>

          <div v-if="isLoading" class="empty-state">
            <div class="spinner"></div>
            <p>Syncing dispatch...</p>
          </div>

          <div v-else-if="availableJobs.length === 0" class="empty-state">
            <p>No new orders right now. Hang tight.</p>
          </div>

          <div v-else v-for="job in availableJobs" :key="job.id" class="job-card available-card">
            <div class="job-header">
              <span class="order-id">Job #{{ job.deliveryId.split('-')[0] }}</span>
              <span class="payout-tag">Available</span>
            </div>

            <div class="job-details">
              <p><strong>Target:</strong> {{ job.targetLocation }}</p>
            </div>

            <button @click="claimJob(job.deliveryId)" class="btn-claim" :disabled="isProcessing">
              Claim Delivery
            </button>
          </div>
        </section>
      </section>

      <!-- OTP PIN MODAL -->
      <div v-if="showPinModal" class="modal-overlay" @click.self="showPinModal = false">
        <div class="modal-content" style="text-align: center;">
          <h2 style="margin-bottom: 0.5rem;">Verify Drop-off</h2>
          <p style="color: #64748b; margin-bottom: 2rem;">
            Ask the customer for their 4-digit PIN to complete the delivery and receive your payout.
          </p>

          <form @submit.prevent="submitDeliveryPin">
            <input
              v-model="pinInput"
              type="text"
              maxlength="4"
              pattern="\d{4}"
              placeholder="0000"
              required
              class="pin-input-field"
            />

            <div class="modal-actions" style="justify-content: center; margin-top: 2rem;">
              <button type="button" class="btn-ghost" @click="showPinModal = false">Cancel</button>
              <button type="submit" class="btn-success" :disabled="isProcessing">
                {{ isProcessing ? 'Verifying...' : 'Confirm PIN' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- EARNINGS TAB -->
      <section v-if="activeTab === 'earnings'" class="tab-content">
        <div class="stat-card balance-card">
          <h3>Wallet Balance</h3>
          <div v-if="isLoading" class="spinner-small"></div>
          <h2 v-else>{{ walletBalance.toFixed(2) }} KES</h2>
          <p>Ready for B2C Withdrawal</p>
          <button
            class="withdraw-btn active-btn"
            @click="showWithdrawalModal = true"
            :disabled="Number(walletBalance) < 10"
          >
            Withdraw to M-Pesa
          </button>
        </div>
      </section>
    </main>

    <!-- WITHDRAWAL MODAL -->
    <div v-if="showWithdrawalModal" class="modal-overlay" @click.self="showWithdrawalModal = false">
      <div class="modal-content">
        <h2>Withdraw to M-Pesa</h2>
        <p>
          Your available balance: <strong>{{ walletBalance.toFixed(2) }} KES</strong>
        </p>

        <form @submit.prevent="requestWithdrawal" style="margin-top: 1.5rem;">
          <div class="form-group">
            <label>Amount to Withdraw (KES)</label>
            <input
              v-model.number="withdrawalAmount"
              type="number"
              required
              min="50"
              :max="walletBalance"
              placeholder="Min 50 KES"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="showWithdrawalModal = false">Cancel</button>
            <button type="submit" class="btn-primary" style="background: #10b981;" :disabled="isWithdrawing">
              {{ isWithdrawing ? 'Processing...' : 'Confirm Withdrawal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import apiClient from '../services/api';

const activeTab = ref('dispatch');
const availableJobs = ref([]);
const myDeliveries = ref([]);
const walletBalance = ref(0);

const isLoading = ref(false);
const isProcessing = ref(false);
const isPolling = ref(true);
let pollingInterval = null;

const isWithdrawing = ref(false);
const withdrawalAmount = ref(0);
const showWithdrawalModal = ref(false);

const showPinModal = ref(false);
const pinInput = ref('');
const activeDeliveryId = ref(null);

const promptForPin = deliveryId => {
  activeDeliveryId.value = deliveryId;
  pinInput.value = '';
  showPinModal.value = true;
};

const fetchDashboardData = async () => {
  try {
    // Fire all 3 requests concurrently for speed
    const [availableRes, activeRes, balanceRes] = await Promise.all([
      apiClient.get('/deliveries/available'),
      apiClient.get('/deliveries/my-active'),
      apiClient.get('/ledger/my-balance'), // Reusing the same endpoint as the merchant
    ]);

    availableJobs.value = availableRes.data;
    myDeliveries.value = activeRes.data;
    walletBalance.value = balanceRes.data.balance || 0;
  } catch (error) {
    console.error('Failed to sync data:', error);
  } finally {
    isLoading.value = false;
  }
};

const claimJob = async deliveryId => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    await apiClient.post(`/deliveries/${deliveryId}/claim`);
    await fetchDashboardData();
  } catch (error) {
    alert(error.response?.data?.message || 'Someone else already claimed this delivery.');
    await fetchDashboardData();
  } finally {
    isProcessing.value = false;
  }
};

const updateStatus = async (deliveryId, newStatus, pin = null) => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    await apiClient.patch(`/deliveries/${deliveryId}/status`, {
      status: newStatus,
      pin: pin,
    });

    if (showPinModal.value) showPinModal.value = false;

    await fetchDashboardData();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update status.');
  } finally {
    isProcessing.value = false;
  }
};

const submitDeliveryPin = async () => {
  if (pinInput.value.length !== 4) {
    alert('Please enter a valid 4-digit PIN.');
    return;
  }
  await updateStatus(activeDeliveryId.value, 'DELIVERED', pinInput.value);
};

const requestWithdrawal = async () => {
  if (withdrawalAmount.value < 50) {
    alert('Minimum withdrawal is 50 KES');
    return;
  }

  if (withdrawalAmount.value > walletBalance.value) {
    alert('Insufficient funds.');
    return;
  }

  isWithdrawing.value = true;
  try {
    // Reusing the exact same wallet endpoint
    await apiClient.post('/api/v1/wallets/withdraw', {
      amount: withdrawalAmount.value,
    });

    alert('Withdrawal initiated! You will receive an M-Pesa message shortly.');
    showWithdrawalModal.value = false;
    withdrawalAmount.value = 0;

    await fetchDashboardData();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to initiate withdrawal.');
  } finally {
    isWithdrawing.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
  pollingInterval = setInterval(fetchDashboardData, 10000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 2rem;
}

.tabs button {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tabs button:hover {
  color: #0f172a;
}

.tabs button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Stat Card (from Merchant UI) */
.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  color: #64748b;
  font-size: 1rem;
}

.stat-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  color: #0f172a;
}

.balance-card {
  border-top: 4px solid #10b981;
}

/* Withdraw Button */
.withdraw-btn {
  width: 100%;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.withdraw-btn:hover:not(:disabled) {
  background: #059669;
}

.withdraw-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
  font-size: 0.875rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

input:focus {
  border-color: #3b82f6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-ghost {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
}
.driver-layout {
  min-height: 100vh;
  background-color: #f1f5f9;
  font-family: system-ui, -apple-system, sans-serif;
}

.driver-header {
  background: #1e293b;
  color: white;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 1.25rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #475569;
}

.status-badge.online {
  background: #10b981;
  animation: pulse 2s infinite;
}

.dashboard-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h2 {
  font-size: 1.125rem;
  color: #334155;
  margin-bottom: 1rem;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.active-card {
  border-left: 4px solid #3b82f6;
}

.available-card {
  border-left: 4px solid #10b981;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
}

.order-id {
  font-weight: 700;
  color: #0f172a;
}

.status-tag,
.payout-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
}

.status-tag.claimed {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-tag.in_transit {
  background: #fef9c3;
  color: #854d0e;
}
.payout-tag {
  background: #dcfce7;
  color: #16a34a;
}

.job-details p {
  margin: 0 0 0.5rem 0;
  color: #475569;
  font-size: 0.95rem;
}

.action-buttons {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}
.btn-success {
  background: #10b981;
  color: white;
}
.btn-claim {
  background: #1e293b;
  color: white;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
  background: white;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.divider {
  border: none;
  border-top: 2px dashed #cbd5e1;
  margin: 2rem 0;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.pin-input-field {
  width: 150px;
  font-size: 2.5rem;
  letter-spacing: 8px;
  text-align: center;
  font-weight: 700;
  padding: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;
}

.pin-input-field:focus {
  border-color: #10b981;
}
</style>
