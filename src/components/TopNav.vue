<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');

const gotToCart = () => {
  router.replace('/checkout');
};

const goToProfile = () => {
  router.replace('/profile');
};
</script>

<template>
  <header class="top-nav">
    <div class="nav-container">
      <div class="brand">
        <div class="logo-icon"></div>
        <h2>Orderly</h2>
      </div>

      <div class="search-bar">
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
          class="search-icon"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Search products..." />
      </div>

      <div class="nav-actions">
        <button class="icon-btn" aria-label="Notifications">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button class="icon-btn" aria-label="Cart" @click="gotToCart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
        <div @click="goToProfile" class="profile-avatar"></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background-image: url('../assets/logo.png'); /* Assumes you added the logo from the previous step */
  background-size: cover;
  border-radius: 50%;
}

.brand h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.search-bar {
  flex: 1;
  max-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: #f9fafb;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.search-bar input:focus {
  background: white;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(20, 85, 217, 0.1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-main);
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  cursor: pointer;
}
</style>
