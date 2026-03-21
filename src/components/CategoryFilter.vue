<script setup>
// defineModel allows us to use v-model="activeCategory" on this component in the parent
const activeId = defineModel({
  type: String,
  required: true,
});

defineProps({
  categories: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="category-wrapper">
    <div class="category-scroll">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-pill"
        :class="{ active: activeId === cat.id }"
        @click="activeId = cat.id"
      >
        <span v-if="cat.icon" class="icon" v-html="cat.icon"></span>
        {{ cat.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-wrapper {
  margin-bottom: 2.5rem;
  width: 100%;
}

.category-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  /* Hide scrollbar for a clean, mobile-native feel */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.category-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.category-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 999px; /* Fully rounded pills */
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap; /* Prevents text from wrapping on mobile */
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.category-pill:hover {
  border-color: var(--primary-blue);
  background: #f8fafc;
}

/* Active State Styling */
.category-pill.active {
  background: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
  box-shadow: 0 4px 12px rgba(20, 85, 217, 0.25);
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ensure SVG icons inherit the text color */
.icon :deep(svg) {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}
</style>
