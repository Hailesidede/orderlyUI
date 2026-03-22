<template>
  <TopNav />
  <div class="layout-wrapper">
    <main class="main-content">
      <div class="welcome-section">
        <h1>Welcome back, {{ user?.fullName || 'Guest' }}!</h1>
        <p>What do you need delivered to your dorm today?</p>
      </div>

      <div v-if="isSyncingMerchants" class="system-state loading" style="padding: 1rem;">
        <p>Loading your merchants...</p>
      </div>

      <div v-else-if="myMerchants.length === 0" class="system-state empty">
        <p>You aren't subscribed to any merchants yet. Scan a Campus Runner QR code to get started!</p>
      </div>

      <CategoryFilter
        v-else
        :categories="myMerchants"
        :modelValue="activeMerchantId"
        @update:modelValue="handleMerchantChange"
      />

      <div v-if="isLoading" class="system-state loading">
        <div class="spinner"></div>
        <p>Syncing catalog...</p>
      </div>

      <div v-else-if="error" class="system-state error">
        <p>{{ error }}</p>
        <button @click="fetchProducts(activeCategory, 0)" class="btn-retry">Retry Connection</button>
      </div>

      <div v-else class="product-grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @open-details="handleOpenDetails"
          @add-to-cart="handleOrder"
        />

        <div v-if="products.length === 0" class="system-state empty">
          No items currently available in this category.
        </div>
      </div>
    </main>

    <ProductModal
      v-if="selectedProduct"
      :is-open="isModalOpen"
      :product="selectedProduct"
      @close="isModalOpen = false"
      @add-to-cart="handleOrder"
    />
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../services/api';
import { useProductStore } from '../stores/product';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import TopNav from '../components/TopNav.vue';
import CategoryFilter from '../components/CategoryFilter.vue';
import ProductCard from '../components/ProductCard.vue';
import ProductModal from '../components/ProductModal.vue';

const route = useRoute();
const router = useRouter();

const productStore = useProductStore();
const authStore = useAuthStore();
const cartStore = useCartStore();

const { products, isLoading, error, activeMerchantId } = storeToRefs(productStore);
const { user } = storeToRefs(authStore);
const { switchMerchant, fetchProducts } = productStore;

const isModalOpen = ref(false);
const selectedProduct = ref(null);

const myMerchants = ref([]);
const isSyncingMerchants = ref(true);

onMounted(async () => {
  const qrMerchantId = route.query.merchantId;
  if (qrMerchantId) {
    try {
      await apiClient.post(`/subscriptions/${qrMerchantId}`);
      router.replace({ path: '/home' });
    } catch (err) {
      console.error('Failed to subscribe via QR code', err);
    }
  }
  await fetchMyMerchants();
});

const fetchMyMerchants = async () => {
  isSyncingMerchants.value = true;
  try {
    const response = await apiClient.get('/subscriptions/my-merchants');
    myMerchants.value = response.data;

    if (myMerchants.value.length > 0) {
      // activeMerchantId.value = myMerchants.value[0].id;
      // fetchProducts(activeMerchantId.value, 0);
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error('Failed to load merchants', err);
  } finally {
    isSyncingMerchants.value = false;
  }
};

const handleMerchantChange = async newMerchantId => {
  await switchMerchant(newMerchantId);
  // activeMerchantId.value = newMerchantId;
  // fetchProducts(newMerchantId, 0);
};

const handleOpenDetails = product => {
  selectedProduct.value = product;
  isModalOpen.value = true;
};

const handleOrder = async product => {
  console.log('product ', product);
  try {
    await cartStore.addItem(product.id, 1);
  } catch (err) {
    alert(cartStore.error || 'Failed to add item to cart');
  }
};
</script>

<style scoped>
.layout-wrapper {
  flex: 1;
  background-color: #f8fafc;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  padding-bottom: 5rem;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.system-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 8px;
  margin-top: 2rem;
}

.system-state.loading {
  color: #64748b;
}
.system-state.error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
.system-state.empty {
  grid-column: 1 / -1;
  background: white;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-retry:hover {
  background-color: #b91c1c;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>
