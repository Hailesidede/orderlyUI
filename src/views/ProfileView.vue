<template>
  <div class="profile-layout">
    <main class="profile-container">
      <div class="profile-header">
        <div class="avatar-large">
          <img src="https://ui-avatars.com/api/?name=Alex+User&background=1455d9&color=fff&size=150" alt="Alex" />
        </div>
        <h2>Alex User</h2>
        <p>alex@university.edu</p>
      </div>

      <div class="settings-group">
        <button class="menu-item">
          <div class="icon-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span>Personal Information</span>
          <span class="chevron">›</span>
        </button>
        <button class="menu-item">
          <div class="icon-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <span>Order History</span>
          <span class="chevron">›</span>
        </button>
        <button class="menu-item">
          <div class="icon-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <span>Payment Methods</span>
          <span class="chevron">›</span>
        </button>
      </div>

      <div class="settings-group">
        <button class="menu-item">
          <div class="icon-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <span>Help & Support</span>
          <span class="chevron">›</span>
        </button>
      </div>

      <button class="logout-btn" @click="handleLogout">
        Log Out
      </button>
    </main>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await authStore.logout();

    router.push('/');
  } catch (error) {
    console.error('Login rejected by backend');
    // Here you would trigger a UI error toast or message
  }
  // Handle Registration logic...
};
</script>

<style scoped>
.profile-layout {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 2rem;
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 5rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.avatar-large {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem auto;
  border-radius: 50%;
  padding: 4px;
  background: white;
  border: 2px solid var(--border-color);
}

.avatar-large img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.profile-header h2 {
  margin: 0 0 0.25rem 0;
  color: var(--text-main);
  font-size: 1.5rem;
}
.profile-header p {
  margin: 0;
  color: var(--text-muted);
}

.settings-group {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}
.menu-item:hover {
  background: #f9fafb;
}

.icon-box {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--text-muted);
}

.menu-item span {
  flex: 1;
  text-align: left;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-main);
}

.menu-item .chevron {
  flex: 0;
  font-size: 1.5rem;
  color: var(--text-muted);
}

.logout-btn {
  width: 100%;
  padding: 1.25rem;
  background: white;
  border: 1px solid #ef4444; /* Red border */
  color: #ef4444;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.logout-btn:hover {
  background: #fef2f2;
}
</style>
