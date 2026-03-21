<script setup>
// Hero component logic can go here if needed in the future
</script>

<template>
  <div class="hero-section">
    <div class="brand">
      <div class="logo-icon"></div>
      <h2>Orderly</h2>
    </div>
    <h1 class="title">Welcome to<br />Orderly.</h1>
    <p class="subtitle">Simplify your order management<br />across all devices.</p>
  </div>
</template>

<style scoped>
.hero-section {
  flex: 1;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 4rem;
}

.logo-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.5);
}

.brand h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
}

.title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 1rem 0;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  .brand {
    margin-bottom: 2rem;
  }
}
</style>
