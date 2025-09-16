import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const SCREEN_LAYOUT = () => import('@/layout/screen-layout.vue');

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/index',
    },
    {
      path: '/login',
      name: 'login',
      // component: Web_LAYOUT,
      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/home',
      name: 'home',
      redirect: '/index',
      component: SCREEN_LAYOUT,
      children: [
        {
          path: '/index',
          name: 'index',
          component: () => import('@/views/screen/index.vue'),
          meta: {
            locale: '主页',
            icon: 'icon-home',
            requiresAuth: false,
            roles: ['*'],
            isPhone: true,
          },
        },
      ],
    },
    // {
    //   path: '/buy',
    //   name: 'buy',
    //   component: () => import('@/views/redirect/buyResult.vue'),
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
    // // 阿里云购买跳转页面
    // {
    //   path: '/alipay',
    //   name: 'alipay',
    //   component: () => import('@/views/redirect/alipay.vue'),
    //   meta: {
    //     requiresAuth: false,
    //   },
    // },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
