<template>
  <div class="checkout-item">
    <div class="item-image">
      <img
        :src="`https://ui-avatars.com/api/?name=${item.name.charAt(0)}&background=random&size=100`"
        :alt="item.name"
      />
    </div>

    <div class="item-details">
      <h4>{{ item.name }}</h4>
      <p class="price">{{ item.price }} KES</p>
    </div>

    <div class="quantity-selector">
      <button @click="emit('decrement', item.productId)" :disabled="item.quantity <= 1">-</button>
      <span>{{ item.quantity }}</span>
      <button @click="emit('increment', item.productId)">+</button>
    </div>

    <button @click="emit('remove', item.productId)" class="delete-btn" title="Remove item">
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
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// Declare the events this component is allowed to fire
const emit = defineEmits(['increment', 'decrement', 'remove']);
</script>

<style scoped>
.checkout-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.item-image img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--text-main);
}

.price {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 0.25rem;
}

.quantity-selector button {
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector span {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

/* Delete Button Styling */
.delete-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #ef4444;
  background-color: #fef2f2;
}
</style>
