<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-content">
        <button class="close-btn" @click="emit('close')">&times;</button>

        <div class="modal-grid">
          <div class="modal-image">
            <img
              :src="product.imageUrl || 'https://placehold.co/400x400/f3f4f6/94a3b8?text=No+Image'"
              :alt="product.name"
              @error="e => (e.target.src = 'https://placehold.co/400x400/f3f4f6/94a3b8?text=No+Image')"
            />
          </div>
          <div class="modal-info">
            <div class="store-badge-wrapper">
              <span class="store-badge">🏪 Sold by: {{ product.storeName || 'Campus Store' }}</span>
            </div>
            <h2>{{ product.name }}</h2>
            <div class="price-tag">{{ product.price }} KES</div>
            <div class="specs">
              <h3>Details</h3>
              <p>{{ product.description }}</p>
            </div>
            <button class="order-btn" @click="emit('add-to-cart', product)">
              Add to Order - {{ product.price }} KES
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'add-to-cart']);
</script>
<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 10;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.modal-image img {
  width: 100%;
  border-radius: 12px;
  background: #f3f4f6;
}

.modal-info {
  display: flex;
  flex-direction: column;
}

.modal-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  color: var(--text-main);
}

.price-tag {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 2rem;
}

.specs {
  flex: 1;
}

.specs h3 {
  font-size: 1rem;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.specs p {
  color: var(--text-muted);
  line-height: 1.6;
}

.order-btn {
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
  margin-top: 1rem;
}

.order-btn:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}

.store-badge-wrapper {
  margin-bottom: 0.75rem;
}

.store-badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1455d9;
  background-color: #eff6ff;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}
</style>
