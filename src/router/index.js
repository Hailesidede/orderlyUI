import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import AuthView from '../views/AuthView.vue';
import HomeView from '../views/HomeView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import SuccessView from '../views/SuccessView.vue';
import TrackingView from '../views/TrackingView.vue';
import ProfileView from '../views/ProfileView.vue';
import PaymentProcessing from '../views/PaymentProcessing.vue';
import DriverDashboard from '../views/DriverDashboard.vue';
import MerchantDashboard from '../views/MerchantDashboard.vue';
import MerchantOnboarding from '../views/MerchantOnboarding.vue';

const routes = [
  {
    path: '/login',
    redirect: to => {
      return { path: '/', query: to.query };
    }
  },
  {
    path: '/',
    name: 'Auth',
    component: AuthView,
    meta: { requiresGuest: true },
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true, requiresRole: 'CUSTOMER' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutView,
    meta: { requiresAuth: true, requiresRole: 'CUSTOMER' },
  },
  {
    path: '/success',
    name: 'Success',
    component: SuccessView,
    meta: { requiresAuth: true, requiresRole: 'CUSTOMER' },
  },
  {
    path: '/tracking/order/:id',
    name: 'Tracking',
    component: TrackingView,
    meta: { requiresAuth: true, requiresRole: 'CUSTOMER' },
  },
  {
    path: '/tracking',
    name: 'TrackingList',
    component: TrackingView,
    meta: { requiresAuth: true, requiresRole: 'CUSTOMER' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: '/payment-processing',
    name: 'Payment-processing',
    component: PaymentProcessing,
    meta: { requiresAuth: true, requiresRole: 'CUSTOMER' },
  },
  {
    path: '/delivery-dashboard',
    name: 'DeliveryDashboard',
    component: DriverDashboard,
    meta: { requiresAuth: true, requiresRole: 'DISTRIBUTOR' },
  },
  {
    path: '/merchant-dashboard',
    name: 'MerchantDashboard',
    component: MerchantDashboard,
    meta: { requiresAuth: true, requiresRole: 'MERCHANT' },
  },
  {
    path: '/merchant-onboarding',
    name: 'MerchantOnboarding',
    component: MerchantOnboarding,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthReady) {
    await authStore.initializeAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;

  const userRole = authStore.user?.role || null;

  const getDefaultRouteForRole = role => {
    if (role === 'DISTRIBUTOR') return '/delivery-dashboard';
    if (role === 'CUSTOMER') return '/home';
    if (role === 'MERCHANT') return '/merchant-dashboard';
    return '/';
  };

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/', query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return { path: getDefaultRouteForRole(userRole) };
  }

  if (to.meta.requiresRole && to.meta.requiresRole !== userRole) {
    console.warn(`[Security] Blocked: Role ${userRole} attempted to access ${to.path}`);

    const safeRoute = getDefaultRouteForRole(userRole);

    if (to.path === safeRoute) {
      console.error('[Router] FATAL: Safe route is rejecting its assigned role.');
      return false;
    }

    return { path: safeRoute };
  }

  return true;
});

export default router;
