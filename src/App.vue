<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import FooterNav from './components/FooterNav.vue';

const route = useRoute();
const showFooter = computed(() => {
  const hiddenRoutes = ['/', '/success','/merchant-onboarding'];
  return !hiddenRoutes.includes(route.path);
});
</script>

<template>
  <router-view />

  <FooterNav v-if="showFooter" />
</template>

<style scoped>
/* No styles needed here, global layout handled in style.css */
</style>
