import { createApp } from 'vue';
import { VueWindowSizePlugin } from 'vue-window-size/option-api';
import App from '@/App.vue';
import router from '@/router';

const app = createApp(App);

app.provide(
  'backendUrl', process.env.NODE_ENV === 'development' ? 'http://192.168.1.146:4567' : '',
);

app.use(router).use(VueWindowSizePlugin).mount('#app');
