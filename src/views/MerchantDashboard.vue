<template>
  <div class="merchant-layout">
    <header class="merchant-header">
      <div class="header-content">
        <h1>Merchant Console</h1>
        <div class="user-info">
          <span>Seller Account</span>
        </div>
      </div>
    </header>

    <main class="dashboard-container">
      <div class="tabs">
        <button :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
          Overview
        </button>
        <button :class="{ active: activeTab === 'inventory' }" @click="activeTab = 'inventory'">
          Inventory
        </button>
        <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
          Store & QR Codes
        </button>
      </div>

      <!-- OVERVIEW TAB -->
      <section v-if="activeTab === 'overview'" class="tab-content">
        <div class="stats-grid">
          <div class="stat-card balance-card">
            <h3>Available Balance</h3>
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

          <div class="stat-card">
            <h3>Active Products</h3>
            <div v-if="isLoading" class="spinner-small"></div>
            <h2 v-else>{{ myProducts.length }}</h2>
            <p>Items listed on marketplace</p>
          </div>
        </div>
      </section>

      <!-- INVENTORY TAB -->
      <section v-if="activeTab === 'inventory'" class="tab-content">
        <div class="section-header">
          <h2>My Products</h2>
          <button @click="showAddModal = true" class="btn-primary">+ Add Product</button>
        </div>

        <div v-if="isLoading" class="empty-state">
          <div class="spinner"></div>
          <p>Loading inventory...</p>
        </div>

        <div v-else-if="myProducts.length === 0" class="empty-state">
          <p>You haven't listed any products yet.</p>
        </div>

        <div v-else class="table-container">
          <table class="inventory-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price (KES)</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in myProducts" :key="product.id">
                <td>
                  <strong>{{ product.name }}</strong>
                  <span class="product-desc">{{ product.description?.substring(0, 30) }}...</span>
                </td>
                <td>{{ product.price }}</td>
                <td>{{ product.stockQuantity }}</td>
                <td>
                  <span class="status-badge" :class="product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'">
                    {{ product.stockQuantity > 0 ? 'Active' : 'Empty' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SETTINGS & QR CODES TAB -->
      <section v-if="activeTab === 'settings'" class="tab-content">
        <div class="section-header">
          <h2>Store Links & QR Codes</h2>
          <p style="color: #64748b;">Print these or share them in WhatsApp groups to grow your business.</p>
        </div>

        <div class="qr-grid">
          <!-- Customer QR -->
          <div class="qr-card customer-card">
            <div class="qr-header">
              <h3>🛒 Customer Link</h3>
              <p>Loyal clients scan this to view your catalog and buy items.</p>
            </div>
            <div class="qr-image-wrapper">
              <qrcode-vue :value="customerLink" :size="200" level="H" render-as="svg" />
            </div>
            <div class="qr-actions">
              <input type="text" readonly :value="customerLink" class="link-input" />
              <button @click="copyToClipboard(customerLink)" class="btn-outline-blue">Copy Link</button>
            </div>
          </div>

          <!-- Distributor QR -->
          <div class="qr-card runner-card">
            <div class="qr-header">
              <h3>🏃‍♂️ Runner Link</h3>
              <p>People scan this to work for you and deliver your orders.</p>
            </div>
            <div class="qr-image-wrapper">
              <qrcode-vue :value="runnerLink" :size="200" level="H" render-as="svg" />
            </div>
            <div class="qr-actions">
              <input type="text" readonly :value="runnerLink" class="link-input" />
              <button @click="copyToClipboard(runnerLink)" class="btn-outline-green">Copy Link</button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ADD PRODUCT MODAL -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h2>Add New Product</h2>
        <form @submit.prevent="submitProduct">
          <div class="form-group">
            <label>Product Name</label>
            <input v-model="newProduct.name" type="text" required placeholder="e.g., Spicy Doritos" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="newProduct.description"
              required
              rows="3"
              placeholder="e.g., 200g bag of nacho cheese flavor..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price (KES)</label>
              <input v-model.number="newProduct.price" type="number" step="0.01" required min="0.01" />
            </div>
            <div class="form-group">
              <label>Delivery Fee (KES)</label>
              <input v-model.number="newProduct.shadowDeliveryFee" type="number" required min="0" />
              <small>Driver's cut per item</small>
            </div>
          </div>

          <div class="form-group">
            <label>Product Image</label>
            <input type="file" accept="image/jpeg, image/png, image/webp" required @change="handleImageUpload" />
          </div>

          <div class="form-group">
            <label>Initial Stock Quantity</label>
            <input v-model.number="newProduct.stockQuantity" type="number" required min="0" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
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
              min="10"
              :max="walletBalance"
              placeholder="Min 10 KES"
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
import { ref, onMounted, computed } from 'vue';
import apiClient from '../services/api';
import { useAuthStore } from '../stores/auth';
import QrcodeVue from 'qrcode.vue';

const authStore = useAuthStore();

const activeTab = ref('overview');
const myProducts = ref([]);
const walletBalance = ref(null);
const isLoading = ref(true);

const showAddModal = ref(false);
const isSubmitting = ref(false);

const isWithdrawing = ref(false);
const withdrawalAmount = ref(0);
const showWithdrawalModal = ref(false);

const selectedImage = ref(null);

const newProduct = ref({
  name: '',
  description: '',
  price: 0,
  shadowDeliveryFee: 0,
  stockQuantity: 1,
});

const merchantId = computed(() => authStore.user?.id || '');
const baseUrl = window.location.origin;

const customerLink = computed(() => `${baseUrl}/login?merchantId=${merchantId.value}`);
const runnerLink = computed(() => `${baseUrl}/login?merchantId=${merchantId.value}&role=DISTRIBUTOR`);

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  } catch (err) {
    alert('Failed to copy link. Please select and copy manually.');
  }
};

const fetchDashboardData = async () => {
  isLoading.value = true;
  try {
    const [balanceRes, productsRes] = await Promise.all([
      apiClient.get('/ledger/my-balance'),
      apiClient.get('/products/me'),
    ]);

    walletBalance.value = balanceRes.data.balance;
    myProducts.value = productsRes.data;
    console.log('products', myProducts.value);
  } catch (error) {
    console.error('Failed to load merchant data:', error);
  } finally {
    isLoading.value = false;
  }
};

// const submitProduct = async () => {
//   isSubmitting.value = true;
//   try {
//     await apiClient.post('/products', newProduct.value);

//     // Reset form with the correct keys
//     newProduct.value = { name: '', description: '', price: 0, shadowDeliveryFee: 0, stockQuantity: 1 };
//     showAddModal.value = false;

//     await fetchDashboardData();
//   } catch (error) {
//     alert(error.response?.data?.message || 'Failed to create product.');
//   } finally {
//     isSubmitting.value = false;
//   }
// };

const submitProduct = async () => {
  if (!selectedImage.value) {
    alert('An image is required for marketplace listings.');
    return;
  }

  isSubmitting.value = true;
  try {
    const formData = new FormData();

    formData.append('product', new Blob([JSON.stringify(newProduct.value)], { type: 'application/json' }));

    formData.append('image', selectedImage.value);

    await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    newProduct.value = { name: '', description: '', price: 0, shadowDeliveryFee: 0, stockQuantity: 1 };
    selectedImage.value = null;
    showAddModal.value = false;

    await fetchDashboardData();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create product.');
  } finally {
    isSubmitting.value = false;
  }
};
const requestWithdrawal = async () => {
  if (withdrawalAmount.value < 5) {
    alert('Minimum withdrawal is 50 KES');
    return;
  }

  if (withdrawalAmount.value > walletBalance.value) {
    alert('Insufficient funds.');
    return;
  }

  isWithdrawing.value = true;
  try {
    await apiClient.post('/wallets/withdraw', {
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

const handleImageUpload = event => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      event.target.value = '';
      return;
    }
    selectedImage.value = file;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.merchant-layout {
  /* min-height: 100vh; */
  background-color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  padding-bottom: 3rem;
}

.merchant-header {
  background: #0f172a;
  color: white;
  padding: 1.5rem 2rem;
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
}

.dashboard-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* Tabs */
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
  color: #1455d9;
  border-bottom-color: #1455d9;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

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

.withdraw-btn {
  width: 100%;
  padding: 0.75rem;
  background: #10b981; /* Bright green */
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.withdraw-btn:hover:not(:disabled) {
  background: #059669; /* Darker green on hover */
}

.withdraw-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.coming-soon {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
  color: #64748b;
}

/* Inventory Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #1455d9;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto;
  border: 1px solid #e2e8f0;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th,
.inventory-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.inventory-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.in-stock {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.out-of-stock {
  background: #fee2e2;
  color: #dc2626;
}

/* Modal */
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

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
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
  border-color: #1455d9;
}

small {
  display: block;
  margin-top: 0.25rem;
  color: #64748b;
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

.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.qr-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.customer-card {
  border-top: 6px solid #1455d9;
}
.runner-card {
  border-top: 6px solid #10b981;
}

.qr-header {
  padding: 1.5rem;
  text-align: center;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.qr-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.qr-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.qr-image-wrapper {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

.qr-image-wrapper img {
  width: 200px;
  height: 200px;
  border: 4px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.qr-actions {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.85rem;
  text-align: center;
}

.btn-outline-blue {
  background: transparent;
  color: #1455d9;
  border: 2px solid #1455d9;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline-blue:hover {
  background: #f0f4ff;
}

.btn-outline-green {
  background: transparent;
  color: #10b981;
  border: 2px solid #10b981;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-outline-green:hover {
  background: #f0fdf4;
}
</style>
