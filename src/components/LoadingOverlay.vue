<template>
  <div class="loading-wrapper">
    <slot />

    <van-overlay :show="loading" class="custom-overlay">
      <div class="wrapper">
        <van-loading type="spinner" color="#1989fa" vertical>
          <span class="loading-text">{{ message }}</span>
        </van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Loading...",
  },
});
</script>

<style scoped>
.loading-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.custom-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Ensures it stays inside the card if the parent has overflow hidden */
  background: rgba(255, 255, 255, 0.7); 
  backdrop-filter: blur(4px);
  border-radius: inherit;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-text {
  margin-top: 8px;
  color: #1989fa;
  font-weight: 500;
}
</style>