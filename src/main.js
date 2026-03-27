import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import Vant from 'vant';
import 'vant/lib/index.css';

createApp(App)
  .use(router)
  .use(createPinia())
  .use(Vant)
  .mount('#app');
