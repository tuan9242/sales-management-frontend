import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import DashboardLayout from '../layouts/DashboardLayout.vue';
import Login from '../views/Auth/Login.vue';
import Register from '../views/Auth/Register.vue';
import Overview from '../views/Dashboard/Overview.vue';
import ProductList from '../views/Products/ProductList.vue';
import OrderList from '../views/Orders/OrderList.vue';
import UserList from '../views/Users/UserList.vue';
import ReportList from '../views/Reports/ReportList.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Overview
      },
      {
        path: 'products',
        name: 'Products',
        component: ProductList
      },
      {
        path: 'orders',
        name: 'Orders',
        component: OrderList
      },
      {
        path: 'users',
        name: 'Users',
        component: UserList
      },
      {
        path: 'reports',
        name: 'Reports',
        component: ReportList
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard kiểm tra trạng thái đăng nhập
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
