<script setup>
// defineModel is the Vue 3.4+ standard for v-model binding
const model = defineModel({
  type: [String, Number],
  default: '',
});

defineProps({
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="input-wrapper">
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      v-bind="$attrs"
      class="base-input"
    />
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
}

.base-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-input);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  color: var(--text-main);
}

.base-input:focus {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(20, 85, 217, 0.1);
}

.base-input::placeholder {
  color: var(--text-muted);
}
</style>
