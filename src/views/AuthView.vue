<script setup>
import AuthHero from '../components/AuthHero.vue';
import AuthForm from '../components/AuthForm.vue';
</script>

<template>
  <main class="auth-layout">
    <div class="auth-container">
      <AuthHero />
      <AuthForm />
    </div>
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  /* Make sure to place the image in your assets folder */
  background-image: url('../assets/authbackground.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2rem;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1100px;
  align-items: center;
  gap: 4rem;
  justify-content: space-between;

   overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 3rem;
}

/* Responsive adjustment for mobile screens */
@media (max-width: 900px) {
  .auth-container {
    flex-direction: column;
    text-align: center;
    gap: 2.5rem;
  }

  .auth-layout {
    padding: 1.5rem;
    align-items: flex-start; /* Prevents clipping on small devices */
    overflow-y: auto;
  }
}
</style>
