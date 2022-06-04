import { createApp } from 'vue';
import { VueWindowSizePlugin } from 'vue-window-size/option-api';
import App from '@/App.vue';
import router from '@/router';

const app = createApp(App);

app.provide('backendUrl', process.env.VUE_APP_BACKEND_URL ?? (
  process.env.NODE_ENV === 'development' ? 'http://localhost:4567' : ''
));

app.use(router).use(VueWindowSizePlugin).mount('#app');
