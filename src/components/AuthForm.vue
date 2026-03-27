<template>
  <div class="form-card">
    <div class="toggle-container">
      <button :class="{ active: isLogin }" @click="isLogin = true">
        LOGIN
      </button>
      <button :class="{ active: !isLogin }" @click="isLogin = false">
        SIGN UP
      </button>
    </div>

    <h3 class="form-title">{{ isLogin ? "LOGIN" : "SIGN-UP" }}</h3>

    <form @submit.prevent="handleSubmit" class="form-body">
      <BaseInput
        v-if="!isLogin"
        v-model="formData.fullName"
        placeholder="Full Name"
        required
      />

      <BaseInput
        v-if="!isLogin"
        v-model="formData.email"
        type="email"
        placeholder="Email"
        required
      />

      <BaseInput
        v-model="formData.phone"
        type="tel"
        placeholder="Phone Number (e.g. 0712345678)"
        required
      />

      <BaseInput
        v-model="formData.password"
        type="password"
        placeholder="Password"
        required
      />

      <BaseInput
        v-if="!isLogin"
        v-model="formData.confirmPassword"
        type="password"
        placeholder="Confirm Password"
        required
      />

      <button type="submit" class="submit-btn">
        {{ isLogin ? "Login" : "Create Account" }}
      </button>
    </form>

    <div class="divider">
      <span>Or sign up with</span>
    </div>

    <div class="social-login">
      <button class="social-btn">
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          width="20"
        />
      </button>
      <button class="social-btn">
        <img
          src="https://www.svgrepo.com/show/511330/apple-173.svg"
          alt="Apple"
          width="20"
        />
      </button>
    </div>

    <p class="switch-mode">
      {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
      <a href="#" @click.prevent="isLogin = !isLogin">
        {{ isLogin ? "Sign Up" : "Log In" }}
      </a>
    </p>
  </div>
</template>
<script setup>
import { ref } from "vue";
import BaseInput from "./BaseInput.vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLogin = ref(!route.query.merchantId);
const isLoading = ref(false);

const formData = ref({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
});

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    if (isLogin.value) {
      await authStore.login({
        phoneNumber: formData.value.phone,
        password: formData.value.password,
        referralMerchantId: route.query.merchantId || null,
      });
    } else {
      if (formData.value.password !== formData.value.confirmPassword) {
        alert("Passwords do not match!");
        isLoading.value = false;
        return;
      }
      await authStore.register({
        fullName: formData.value.fullName,
        phoneNumber: formData.value.phone,
        password: formData.value.password,
        role: route.query.role === "DISTRIBUTOR" ? "DISTRIBUTOR" : "CUSTOMER",
        referralMerchantId: route.query.merchantId || null,
      });
    }
    const redirectPath =
      route.query.redirect ||
      (route.query.role === "DISTRIBUTOR" ? "/delivery-dashboard" : "/home");
    router.push(redirectPath);
  } catch (error) {
    console.error("Auth failed", error);
    alert(
      error.response?.data?.message ||
        "Authentication failed. Please try again.",
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Removed all .input-group and input specific styles from here.
  They are now perfectly encapsulated in BaseInput.vue. 
*/

.form-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (max-width: 900px) {
  .form-card {
  }

  .toggle-container {
    margin-right: 10px;
    margin-left: 10px;
  }

  .submit-btn {
    margin-right: 10px;
    margin-left: 10px;
  }

  :deep(.base-input) {
    width: 86%;
    padding: 0.875rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 0.95rem;
    background: var(--bg-input);
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    font-family: inherit;
    color: var(--text-main);
  }
}

.toggle-container {
  display: flex;
  background: #e5e7eb;
  border-radius: 999px;
  padding: 0.35rem;
  margin-bottom: 2rem;
}

.toggle-container button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-container button.active {
  background: var(--primary-blue);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.submit-btn {
  margin-top: 0.5rem;
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.submit-btn:hover {
  background: var(--primary-hover);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 1rem;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.social-btn:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}

.switch-mode {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.switch-mode a {
  color: var(--primary-blue);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
}

.switch-mode a:hover {
  text-decoration: underline;
}
</style>
