import { Layout } from '@/utils/routerHelper'


const handRouter: AppRouteRecordRaw[] = [
  {
    path: '/lowCode',
    component: Layout,
    name: 'lowCode',
    meta: {
      hidden: true,

    },
    children: [
      {
        path: 'LowForm',
        component: () => import('@/views/lowcode/index.vue'),
        name: 'LowForm',
        meta: {
          canTo: true,
          hidden: true,
          noTagsView: false,
          icon: 'ep:user',
          // title: t('common.profile')
          title: '流程表单'
        }
      },
    ]
  },
]
export default handRouter
