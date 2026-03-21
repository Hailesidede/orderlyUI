<template>
  <div class="product-card">
    <div class="image-container">
      <img :src="product.imageUrl || fallbackImage" :alt="product.name" loading="lazy" @error="handleImageError" />
    </div>
    <div class="card-content">
      <div class="store-badge-wrapper" :title="product.storeName">
        <span class="store-badge">🏪 {{ product.storeName || 'Campus Store' }}</span>
      </div>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc">{{ product.description }}</p>
      <div class="price">{{ product.price }} KES</div>
      <div class="card-actions">
        <button class="btn-secondary" @click="emit('open-details', product)">Description</button>
        <button class="btn-primary" @click="emit('add-to-cart', product)" :disabled="isAdding">
          <span v-if="isAdding" class="spinner-small"></span>
          <span v-else>Add to Cart</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  product: {
    type: Object,
    required: true,
  },
  isAdding: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['open-details', 'add-to-cart']);

const fallbackImage = 'https://placehold.co/400x400/f3f4f6/94a3b8?text=No+Image';

const handleImageError = event => {
  event.target.src = fallbackImage;
};
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.image-container {
  height: 200px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .image-container img {
  transform: scale(1.05);
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
}

.product-desc {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 1.25rem;
  margin-top: auto;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

button {
  padding: 0.6rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background: white;
  border: 1px solid var(--primary-blue);
  color: var(--primary-blue);
}

.btn-secondary:hover {
  background: #f0f4ff;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.store-badge-wrapper {
  margin-bottom: 0.5rem;
  max-width: 100%;
}

.store-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1455d9;
  background-color: #eff6ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #bfdbfe;
}
</style>
