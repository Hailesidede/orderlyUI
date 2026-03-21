<template>
  <nav class="mobile-footer">
    <!-- ONLY CUSTOMERS SEE THESE -->
    <template v-if="isCustomer">
      <router-link to="/home" class="nav-item" active-class="active">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Home</span>
      </router-link>

      <router-link to="/checkout" class="nav-item" active-class="active">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Cart</span>
      </router-link>

      <router-link to="/tracking" class="nav-item" active-class="active">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>Tracking</span>
      </router-link>
    </template>

    <!-- EVERYONE SEES PROFILE -->
    <router-link to="/profile" class="nav-item" active-class="active">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span>Profile</span>
    </router-link>
  </nav>
</template>
<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const isCustomer = computed(() => {
  return authStore.user?.role === 'CUSTOMER';
});
</script>

<style scoped>
.mobile-footer {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999; /* Forces it above all other content */

  /* SIZING & SHAPE */
  width: max-content;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5rem;
  padding: 0.75rem 2.5rem;
  border-radius: 999px;

  /* FROSTED GLASS EFFECT */
  background: rgba(255, 255, 255, 0.95); /* Slightly more solid so text doesn't bleed */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item.active {
  color: var(--primary-blue);
}

.nav-item.active svg {
  transform: translateY(-3px);
  stroke-width: 2.5px;
}

/* MOBILE: Full Width Bottom Bar */
@media (max-width: 768px) {
  .mobile-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    width: auto;

    justify-content: space-around;
    gap: 0;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    padding-top: 0.75rem;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  }

  .nav-item {
    flex: 1;
  }
}
</style>
