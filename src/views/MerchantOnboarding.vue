<template>
  <div class="onboarding-layout">
    <div class="onboarding-card">
      <!-- Progress Indicator -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: step === 1 ? '50%' : '100%' }"></div>
      </div>

      <!-- STEP 1: Core Account -->
      <div v-if="step === 1" class="step-content">
        <h2>Become a Campus Seller</h2>
        <p>Create your merchant account to start earning today.</p>

        <form @submit.prevent="handleStepOne">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="accountData.fullName" type="text" required />
          </div>
          <div class="form-group">
            <label>Phone Number (M-Pesa)</label>
            <input v-model="accountData.phone" type="tel" required placeholder="07..." />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="accountData.password" type="password" required />
          </div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            {{ isLoading ? 'Creating Account...' : 'Continue to Store Setup &rarr;' }}
          </button>
        </form>
      </div>

      <!-- STEP 2: Extended Business Details -->
      <div v-if="step === 2" class="step-content">
        <h2>Setup Your Storefront</h2>
        <!-- <p>Tell clients where to find you and what you sell.</p> -->
        <form @submit.prevent="handleStepTwo">
          <div class="form-group">
            <label>Store Name</label>
            <input v-model="storeData.storeName" type="text" required placeholder="e.g., Alice's Snacks" />
          </div>
          <div class="form-group">
            <label>Campus Location / Dorm</label>
            <input v-model="storeData.location" type="text" required placeholder="e.g., Kiambu" />
          </div>
          <div class="form-group">
            <label>Short Description</label>
            <textarea v-model="storeData.description" rows="3" placeholder="What do you sell?"></textarea>
          </div>

          <button type="submit" class="btn-success" :disabled="isLoading">
            {{ isLoading ? 'Launching...' : 'Launch My Store 🚀' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import apiClient from '../services/api';

const router = useRouter();
const authStore = useAuthStore();

const step = ref(1);
const isLoading = ref(false);

const accountData = ref({ fullName: '', phone: '', password: '' });
const storeData = ref({ storeName: '', location: '', description: '' });

// 1. Create the User (Auth)
const handleStepOne = async () => {
  isLoading.value = true;
  try {
    // We hardcode the MERCHANT role here
    await authStore.register({
      fullName: accountData.value.fullName,
      phoneNumber: accountData.value.phone,
      password: accountData.value.password,
      role: 'MERCHANT',
    });
    step.value = 2;
  } catch (error) {
    alert(error.response?.data?.message || 'Registration failed.');
  } finally {
    isLoading.value = false;
  }
};

// 2. Create the MerchantProfile
const handleStepTwo = async () => {
  isLoading.value = true;
  try {
    // Because they are logged in, Axios will automatically attach their JWT Bearer token
    await apiClient.post('/merchants/profile', storeData.value);

    // Setup complete, route to their new dashboard
    router.push('/merchant-dashboard');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to save store details.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.onboarding-layout {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.onboarding-card {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 6px;
  background: #e2e8f0;
  width: 100%;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.4s ease;
}

.step-content {
  padding: 3rem;
}

h2 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
}
p {
  color: #64748b;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  margin-bottom: 0.5rem;
}
input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
}
input:focus,
textarea:focus {
  border-color: #10b981;
}

.btn-primary,
.btn-success {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  color: white;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-primary {
  background: #1455d9;
}
.btn-success {
  background: #10b981;
}
</style>
