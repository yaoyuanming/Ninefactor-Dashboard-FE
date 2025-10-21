import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import { getToken } from '@/utils/auth';

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
          component: () => import('@/views/screen/screen-yanhua/index.vue'),
          meta: {
            locale: '主页',
            icon: 'icon-home',
            requiresAuth: true,
            roles: ['*'],
            isPhone: true,
          },
        },
      ],
    },
    {
      path: '/system',
      name: 'system',
      component: () => import('@/views/system/index.vue'),
      meta: {
        locale: '系统设置',
        requiresAuth: true,
      },
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

// 全局前置守卫：检查登录状态
router.beforeEach((to, from, next) => {
  NProgress.start();

  const token = getToken();
  const requiresAuth = to.meta.requiresAuth !== false; // 默认需要认证

  // 如果访问登录页
  if (to.path === '/login') {
    // 如果已登录，跳转到首页
    if (token) {
      next({ path: '/index' });
    } else {
      next();
    }
    NProgress.done();
    return;
  }

  // 如果需要认证但没有 token
  if (requiresAuth && !token) {
    next({ path: '/login' });
    NProgress.done();
    return;
  }

  // 其他情况正常放行
  next();
});

// 全局后置钩子
router.afterEach(() => {
  NProgress.done();
});

export default router;
