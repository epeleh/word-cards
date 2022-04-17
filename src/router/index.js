import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/edit/:cardId(\\d+)?',
    name: 'Edit',
    // route level code-splitting
    // this generates a separate chunk (edit.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "edit" */ '../views/Edit.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  sensitive: true,
  routes,
});

export default router;
