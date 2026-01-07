import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const SCREEN_LAYOUT = () => import('@/layout/screen-layout.vue');
const SCREEN_3D = () => import('@/views/screen/screen-3d/index.vue');

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/screen/3d/monitor',
    },
    {
      path: '/index',
      redirect: '/screen/3d/monitor',
    },
    {
      path: '/login',
      name: 'login',

      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/screen',
      component: SCREEN_LAYOUT,
      children: [
        {
          path: '3d',
          component: SCREEN_3D,
          redirect: '/screen/3d/monitor',
          children: [
            {
              path: 'monitor',
              name: 'screen-monitor',
              component: () =>
                import('@/views/screen/screen-3d/pages/MonitorOverview.vue'),
              meta: {
                locale: '监测一张图',
                requiresAuth: false,
                background: 'map',
              },
            },
            {
              path: 'report',
              name: 'screen-report',
              component: () =>
                import('@/views/screen/screen-3d/pages/ReportMonitor.vue'),
              meta: {
                locale: '报警监测',
                requiresAuth: false,
                background: 'panel',
              },
            },
            {
              path: 'warning',
              name: 'screen-warning',
              component: () =>
                import('@/views/screen/screen-3d/pages/WarningMonitor.vue'),
              meta: {
                locale: '预警监测',
                requiresAuth: false,
                background: 'panel',
              },
            },
            {
              path: 'video',
              name: 'screen-video',
              component: () =>
                import('@/views/screen/screen-3d/pages/VideoMonitor.vue'),
              meta: {
                locale: '视频监测',
                requiresAuth: false,
                background: 'panel',
              },
            },
            {
              path: 'info',
              name: 'screen-info',
              component: () =>
                import('@/views/screen/screen-3d/pages/InfoManage.vue'),
              meta: {
                locale: '信息管理',
                requiresAuth: false,
                background: 'panel',
              },
            },
          ],
        },
        {
          path: 'map',
          name: 'screen-map',
          component: () => import('@/views/screen/screen-map/index.vue'),
          meta: {
            locale: '二维地图',
            requiresAuth: false,
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
